<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { jsPDF } from 'jspdf'
import { supabase } from '@/lib/supabaseClient'

interface ExportRecipe {
  id: string
  title: string
  description: string | null
  category: string | null
  difficulty: string | null
  duration_minutes: number
  servings: number | null
}

interface ExportIngredient {
  id: number
  recipe_id: string
  name: string
  amount: string | null
}

interface ExportStep {
  id: number
  recipe_id: string
  step_number: number
  content: string
}

interface ExportRecipeImage {
  id: number
  recipe_id: string
  image_url: string
}

const route = useRoute()
const isMenuOpen = ref(false)
const isExporting = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const exportRecipesToPdf = async () => {
  if (isExporting.value) {
    return
  }

  try {
    isExporting.value = true
    closeMenu()

    const { data: recipesData, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, description, category, difficulty, duration_minutes, servings')
      .order('title', { ascending: true })

    if (recipesError) {
      throw recipesError
    }

    const recipes = (recipesData ?? []) as ExportRecipe[]

    if (recipes.length === 0) {
      window.alert('Nebyly nalezeny žádné recepty k exportu.')
      return
    }

    const recipeIds = recipes.map((recipe) => recipe.id)

    const [
      { data: ingredientsData, error: ingredientsError },
      { data: stepsData, error: stepsError },
      { data: imagesData, error: imagesError },
    ] = await Promise.all([
      supabase.from('recipe_ingredients').select('id, recipe_id, name, amount').in('recipe_id', recipeIds),
      supabase
        .from('recipe_steps')
        .select('id, recipe_id, step_number, content')
        .in('recipe_id', recipeIds)
        .order('step_number', { ascending: true }),
      supabase
        .from('recipe_images')
        .select('id, recipe_id, image_url')
        .in('recipe_id', recipeIds)
        .order('id', { ascending: true }),
    ])

    if (ingredientsError) {
      throw ingredientsError
    }

    if (stepsError) {
      throw stepsError
    }

    if (imagesError) {
      throw imagesError
    }

    const ingredientsByRecipe = new Map<string, ExportIngredient[]>()
    const stepsByRecipe = new Map<string, ExportStep[]>()
    const firstImageByRecipe = new Map<string, string>()

    ;((ingredientsData ?? []) as ExportIngredient[]).forEach((ingredient) => {
      const existing = ingredientsByRecipe.get(ingredient.recipe_id) ?? []
      existing.push(ingredient)
      ingredientsByRecipe.set(ingredient.recipe_id, existing)
    })

    ;((stepsData ?? []) as ExportStep[]).forEach((step) => {
      const existing = stepsByRecipe.get(step.recipe_id) ?? []
      existing.push(step)
      stepsByRecipe.set(step.recipe_id, existing)
    })

    ;((imagesData ?? []) as ExportRecipeImage[]).forEach((image) => {
      if (!firstImageByRecipe.has(image.recipe_id)) {
        firstImageByRecipe.set(image.recipe_id, image.image_url)
      }
    })

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const canvasWidth = 1240
    const canvasHeight = 1754
    const accentColor =
      getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#d6a24a'
    const accentHoverColor =
      getComputedStyle(document.documentElement).getPropertyValue('--accent-color-hover').trim() || '#c97d62'
    const headingFont = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    const bodyFont = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    const textPrimary = '#ffffff'
    const textSecondary = '#d2d2d2'
    const glassFill = 'rgba(255,255,255,0.08)'
    const glassBorder = 'rgba(255,255,255,0.18)'

    const createPageCanvas = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Nepodařilo se vytvořit canvas pro PDF export.')
      }

      return { canvas, context }
    }

    const loadImageElement = async (imageUrl: string) => {
      try {
        const response = await fetch(imageUrl)
        if (!response.ok) {
          return null
        }

        const imageBlob = await response.blob()

        return await new Promise<HTMLImageElement | null>((resolve) => {
          const objectUrl = URL.createObjectURL(imageBlob)
          const image = new Image()

          image.onload = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(image)
          }

          image.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(null)
          }

          image.src = objectUrl
        })
      } catch {
        return null
      }
    }

    const wrapCanvasText = (
      context: CanvasRenderingContext2D,
      text: string,
      maxWidth: number,
      maxLines: number,
      truncate = true,
    ) => {
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = ''

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word

        if (context.measureText(testLine).width <= maxWidth) {
          currentLine = testLine
        } else {
          if (currentLine) {
            lines.push(currentLine)
          }
          currentLine = word
        }
      })

      if (currentLine) {
        lines.push(currentLine)
      }

      if (!truncate) {
        return lines
      }

      const output = lines.slice(0, maxLines)
      if (lines.length > maxLines && output.length > 0) {
        output[output.length - 1] = `${output[output.length - 1]} …`
      }

      return output
    }

    const drawCoverImage = (
      context: CanvasRenderingContext2D,
      image: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number,
    ) => {
      const imageRatio = image.width / image.height
      const targetRatio = width / height

      let sourceWidth = image.width
      let sourceHeight = image.height
      let sourceX = 0
      let sourceY = 0

      if (imageRatio > targetRatio) {
        sourceWidth = image.height * targetRatio
        sourceX = (image.width - sourceWidth) / 2
      } else {
        sourceHeight = image.width / targetRatio
        sourceY = (image.height - sourceHeight) / 2
      }

      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
    }

    const drawFooter = (context: CanvasRenderingContext2D, pageNumber: number) => {
      context.fillStyle = 'rgba(255,255,255,0.85)'
      context.font = `500 24px ${bodyFont}`
      const label = `Strana ${pageNumber}`
      const width = context.measureText(label).width
      context.fillText(label, (canvasWidth - width) / 2, canvasHeight - 36)
    }

    const drawRoundedCard = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
      fill: string,
      stroke: string,
    ) => {
      context.beginPath()
      context.roundRect(x, y, width, height, radius)
      context.fillStyle = fill
      context.fill()
      context.strokeStyle = stroke
      context.lineWidth = 2
      context.stroke()
    }

    const backgroundTexture = await loadImageElement('/black-textured-background.jpg')

    const drawWebBackground = (context: CanvasRenderingContext2D) => {
      context.fillStyle = '#222120'
      context.fillRect(0, 0, canvasWidth, canvasHeight)

      if (backgroundTexture) {
        drawCoverImage(context, backgroundTexture, 0, 0, canvasWidth, canvasHeight)
      }

      const overlayGradient = context.createLinearGradient(0, 0, 0, canvasHeight)
      overlayGradient.addColorStop(0, 'rgba(0,0,0,0.08)')
      overlayGradient.addColorStop(0.4, 'rgba(0,0,0,0)')
      overlayGradient.addColorStop(0.72, 'rgba(34,33,32,0.48)')
      overlayGradient.addColorStop(1, 'rgba(34,33,32,0.9)')
      context.fillStyle = overlayGradient
      context.fillRect(0, 0, canvasWidth, canvasHeight)
    }

    const pages: string[] = []
    const tocEntries: Array<{ title: string; page: number }> = []

    const addCanvasPage = (canvas: HTMLCanvasElement) => {
      pages.push(canvas.toDataURL('image/jpeg', 0.95))
    }

    const { canvas: tocPlaceholder, context: tocPlaceholderContext } = createPageCanvas()
    tocPlaceholderContext.fillStyle = '#ffffff'
    tocPlaceholderContext.fillRect(0, 0, canvasWidth, canvasHeight)
    addCanvasPage(tocPlaceholder)

    for (const [index, recipe] of recipes.entries()) {
      const recipeStartPage = pages.length + 1
      tocEntries.push({ title: `${index + 1}. ${recipe.title}`, page: recipeStartPage })

      const { canvas, context } = createPageCanvas()

      drawWebBackground(context)

      drawRoundedCard(
        context,
        40,
        40,
        canvasWidth - 80,
        canvasHeight - 110,
        26,
        'rgba(0,0,0,0.42)',
        glassBorder,
      )

      const headerGradient = context.createLinearGradient(40, 40, canvasWidth - 40, 250)
      headerGradient.addColorStop(0, accentColor)
      headerGradient.addColorStop(1, accentHoverColor)
      context.fillStyle = headerGradient
      context.beginPath()
      context.roundRect(40, 40, canvasWidth - 80, 210, [26, 26, 0, 0])
      context.fill()

      context.fillStyle = textPrimary
      context.font = `700 56px ${headingFont}`
      const titleLines = wrapCanvasText(context, recipe.title, canvasWidth - 180, 2)
      titleLines.forEach((line, lineIndex) => {
        context.fillText(line, 85, 120 + lineIndex * 60)
      })

      context.font = `500 28px ${bodyFont}`
      context.fillText(`Recept ${index + 1} z ${recipes.length}`, 85, 215)

      context.fillStyle = textSecondary
      context.font = `600 28px ${headingFont}`
      const metaLine = [
        `Čas: ${recipe.duration_minutes} min`,
        `Porce: ${recipe.servings ?? '-'}`,
        `Náročnost: ${recipe.difficulty ?? '-'}`,
        `Kategorie: ${recipe.category ?? '-'}`,
      ].join('  |  ')

      const metaLines = wrapCanvasText(context, metaLine, canvasWidth - 170, 2)
      metaLines.forEach((line, lineIndex) => {
        context.fillText(line, 85, 305 + lineIndex * 38)
      })

      const imageX = 85
      const imageY = 360
      const imageWidth = canvasWidth - 170
      const imageHeight = 390

      context.strokeStyle = 'rgba(255,255,255,0.3)'
      context.lineWidth = 2
      context.beginPath()
      context.roundRect(imageX, imageY, imageWidth, imageHeight, 16)
      context.stroke()

      const imageUrl = firstImageByRecipe.get(recipe.id)
      if (imageUrl) {
        const imageElement = await loadImageElement(imageUrl)

        if (imageElement) {
          context.save()
          context.beginPath()
          context.rect(imageX + 2, imageY + 2, imageWidth - 4, imageHeight - 4)
          context.clip()
          drawCoverImage(context, imageElement, imageX + 2, imageY + 2, imageWidth - 4, imageHeight - 4)
          context.restore()
        }
      }

      context.fillStyle = textSecondary
      context.font = `400 26px ${bodyFont}`
      const descriptionText = recipe.description ? `Popis: ${recipe.description}` : 'Popis: —'
      const descriptionLines = wrapCanvasText(context, descriptionText, canvasWidth - 170, 2)
      descriptionLines.forEach((line, lineIndex) => {
        context.fillText(line, 85, 800 + lineIndex * 34)
      })

      const sectionY = 860
      const sectionGap = 34
      const sectionX = 85
      const sectionWidth = canvasWidth - sectionX * 2 - sectionGap
      const cardWidth = sectionWidth / 2
      const cardHeight = 730

      const drawSectionCard = (title: string, rows: string[], x: number, maxLines: number) => {
        drawRoundedCard(context, x, sectionY, cardWidth, cardHeight, 18, glassFill, glassBorder)

        const sectionHeaderGradient = context.createLinearGradient(x, sectionY, x + cardWidth, sectionY + 60)
        sectionHeaderGradient.addColorStop(0, accentColor)
        sectionHeaderGradient.addColorStop(1, accentHoverColor)
        context.fillStyle = sectionHeaderGradient
        context.beginPath()
        context.roundRect(x, sectionY, cardWidth, 60, [18, 18, 0, 0])
        context.fill()

        context.fillStyle = '#ffffff'
        context.font = `700 30px ${headingFont}`
        context.fillText(title, x + 22, sectionY + 40)

        context.fillStyle = textSecondary
        context.font = `400 22px ${bodyFont}`
        const allLines: string[] = []
        rows.forEach((row) => {
          allLines.push(...wrapCanvasText(context, row, cardWidth - 44, 1000, true))
        })

        const visibleLines = allLines.slice(0, maxLines)
        if (allLines.length > maxLines && visibleLines.length > 0) {
          visibleLines[visibleLines.length - 1] = `${visibleLines[visibleLines.length - 1]} …`
        }

        visibleLines.forEach((line, lineIndex) => {
          context.fillText(line, x + 22, sectionY + 98 + lineIndex * 27)
        })
      }

      const ingredients = ingredientsByRecipe.get(recipe.id) ?? []
      const ingredientRows =
        ingredients.length > 0
          ? ingredients.map((ingredient) => {
              const amountLabel = ingredient.amount ? ` — ${ingredient.amount}` : ''
              return `• ${ingredient.name}${amountLabel}`
            })
          : ['Bez ingrediencí']

      drawSectionCard('Ingredience', ingredientRows, sectionX, 24)

      const steps = stepsByRecipe.get(recipe.id) ?? []
      const stepRawRows =
        steps.length > 0 ? steps.map((step) => `${step.step_number}. ${step.content}`) : ['Bez postupu']

      context.font = `400 22px ${bodyFont}`
      const stepLines: string[] = []
      stepRawRows.forEach((row) => {
        stepLines.push(...wrapCanvasText(context, row, cardWidth - 44, 1000, false))
      })

      const firstPageStepCapacity = 24
      const firstStepChunk = stepLines.slice(0, firstPageStepCapacity)
      drawSectionCard('Postup', firstStepChunk, sectionX + cardWidth + sectionGap, firstPageStepCapacity)

      drawFooter(context, recipeStartPage)
      addCanvasPage(canvas)

      let renderedLines = firstPageStepCapacity
      while (renderedLines < stepLines.length) {
        const { canvas: continueCanvas, context: continueContext } = createPageCanvas()

        drawWebBackground(continueContext)

        drawRoundedCard(
          continueContext,
          40,
          40,
          canvasWidth - 80,
          canvasHeight - 110,
          26,
          'rgba(0,0,0,0.42)',
          glassBorder,
        )

        const continueHeaderGradient = continueContext.createLinearGradient(40, 40, canvasWidth - 40, 210)
        continueHeaderGradient.addColorStop(0, accentColor)
        continueHeaderGradient.addColorStop(1, accentHoverColor)
        continueContext.fillStyle = continueHeaderGradient
        continueContext.beginPath()
        continueContext.roundRect(40, 40, canvasWidth - 80, 170, [26, 26, 0, 0])
        continueContext.fill()

        continueContext.fillStyle = '#ffffff'
        continueContext.font = `700 52px ${headingFont}`
        const continueTitle = wrapCanvasText(
          continueContext,
          `${recipe.title} — pokračování postupu`,
          canvasWidth - 180,
          2,
        )
        continueTitle.forEach((line, idx) => {
          continueContext.fillText(line, 85, 115 + idx * 56)
        })

        const cardX = 85
        const cardY = 250
        const cardWidthFull = canvasWidth - 170
        const cardHeightFull = 1310

        drawRoundedCard(continueContext, cardX, cardY, cardWidthFull, cardHeightFull, 18, glassFill, glassBorder)

        const continueSectionGradient = continueContext.createLinearGradient(cardX, cardY, cardX + cardWidthFull, cardY + 60)
        continueSectionGradient.addColorStop(0, accentColor)
        continueSectionGradient.addColorStop(1, accentHoverColor)
        continueContext.fillStyle = continueSectionGradient
        continueContext.beginPath()
        continueContext.roundRect(cardX, cardY, cardWidthFull, 60, [18, 18, 0, 0])
        continueContext.fill()
        continueContext.fillStyle = '#ffffff'
        continueContext.font = `700 30px ${headingFont}`
        continueContext.fillText('Postup', cardX + 24, cardY + 40)

        continueContext.fillStyle = textSecondary
        continueContext.font = `400 24px ${bodyFont}`
        const continuationCapacity = 43
        const chunk = stepLines.slice(renderedLines, renderedLines + continuationCapacity)

        chunk.forEach((line, lineIndex) => {
          continueContext.fillText(line, cardX + 24, cardY + 100 + lineIndex * 29)
        })

        renderedLines += chunk.length
        drawFooter(continueContext, pages.length + 1)
        addCanvasPage(continueCanvas)
      }
    }

    const { canvas: tocCanvas, context: tocContext } = createPageCanvas()
    drawWebBackground(tocContext)
    drawRoundedCard(
      tocContext,
      40,
      40,
      canvasWidth - 80,
      canvasHeight - 110,
      26,
      'rgba(0,0,0,0.42)',
      glassBorder,
    )
    const tocHeaderGradient = tocContext.createLinearGradient(40, 40, canvasWidth - 40, 260)
    tocHeaderGradient.addColorStop(0, accentColor)
    tocHeaderGradient.addColorStop(1, accentHoverColor)
    tocContext.fillStyle = tocHeaderGradient
    tocContext.beginPath()
    tocContext.roundRect(40, 40, canvasWidth - 80, 220, [26, 26, 0, 0])
    tocContext.fill()

    tocContext.fillStyle = '#ffffff'
    tocContext.font = `700 64px ${headingFont}`
    tocContext.fillText('Kuchařka — Obsah', 80, 130)
    tocContext.font = `500 30px ${bodyFont}`
    tocContext.fillText(`Celkem receptů: ${recipes.length}`, 80, 200)

    tocContext.fillStyle = textPrimary
    tocContext.font = `700 36px ${headingFont}`
    tocContext.fillText('Seznam receptů', 80, 320)

    tocContext.fillStyle = textSecondary
    tocContext.font = `400 25px ${bodyFont}`
    let tocY = 370
    const maxTocRows = 40
    const tocRows = tocEntries.slice(0, maxTocRows)
    tocRows.forEach((entry) => {
      const line = `${entry.title}`
      const pageLabel = `${entry.page}`
      const pageLabelWidth = tocContext.measureText(pageLabel).width
      const maxTitleWidth = canvasWidth - 180 - pageLabelWidth
      const titleLine = wrapCanvasText(tocContext, line, maxTitleWidth, 1)[0] ?? line

      tocContext.fillText(titleLine, 80, tocY)
      tocContext.fillText(pageLabel, canvasWidth - 90 - pageLabelWidth, tocY)
      tocContext.strokeStyle = 'rgba(255,255,255,0.25)'
      tocContext.beginPath()
      tocContext.moveTo(80, tocY + 8)
      tocContext.lineTo(canvasWidth - 90, tocY + 8)
      tocContext.stroke()
      tocY += 34
    })

    if (tocEntries.length > maxTocRows) {
      tocContext.fillStyle = 'rgba(255,255,255,0.75)'
      tocContext.font = `italic 22px ${bodyFont}`
      tocContext.fillText(`… a dalších ${tocEntries.length - maxTocRows} receptů`, 80, tocY + 20)
    }

    drawFooter(tocContext, 1)
    pages[0] = tocCanvas.toDataURL('image/jpeg', 0.95)

    pages.forEach((pageData, index) => {
      if (index > 0) {
        doc.addPage()
      }
      doc.addImage(pageData, 'JPEG', 0, 0, pageWidth, pageHeight)
    })

    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    const openedWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

    if (!openedWindow) {
      window.alert('Prohlížeč zablokoval nové okno. Povol prosím popup okna pro zobrazení PDF.')
      URL.revokeObjectURL(pdfUrl)
      return
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(pdfUrl)
    }, 60_000)
  } catch (error) {
    console.error('Chyba při exportu PDF:', error)
    window.alert('Nepodařilo se vytvořit PDF export receptů.')
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-content">
      <a href="/" class="logo">Kuchařka</a>

      <button class="menu-toggle" @click="toggleMenu" :class="{ active: isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav-links" :class="{ active: isMenuOpen }">
        <li><a href="/" :class="{ active: route.path === '/' }" @click="closeMenu">Domů</a></li>
        <li>
          <a href="/recepty" :class="{ active: route.path === '/recepty' }" @click="closeMenu"
            >Recepty</a
          >
        </li>
        <li>
          <a href="/o-nas" :class="{ active: route.path === '/o-nas' }" @click="closeMenu">O nás</a>
        </li>
        <li>
          <a href="/tipy" :class="{ active: route.path === '/tipy' }" @click="closeMenu">Tipy</a>
        </li>
        <li>
          <button class="export-btn" type="button" :disabled="isExporting" @click="exportRecipesToPdf">
            {{ isExporting ? 'Exportuji PDF...' : 'PDF export' }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 2rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.logo {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-decoration: none;
  cursor: pointer;
  z-index: 1001;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  z-index: 1001;
}

.menu-toggle span {
  width: 25px;
  height: 3px;
  background: #fff;
  transition: all 0.3s;
  border-radius: 3px;
}

.menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  font-size: 1.25rem;
  transition: color 0.3s;
}

.export-btn {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #fff;
  font-size: 1.05rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s;
}

.export-btn:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--accent-color);
}

@media (max-width: 768px) {
  .nav-content {
    padding: 0 1.5rem;
  }

  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: -150%;
    left: 0;
    width: 100%;
    height: auto;
    max-height: 0;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.95);
    flex-direction: column;
    gap: 0;
    padding-top: 0;
    padding-bottom: 0;
    transition: all 0.4s ease-in-out;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  .nav-links.active {
    top: 0;
    max-height: 500px;
    padding-top: 6rem;
    padding-bottom: 2rem;
  }

  .nav-links li {
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-links a {
    display: block;
    padding: 1.5rem 2rem;
    font-size: 1.2rem;
  }

  .export-btn {
    width: calc(100% - 4rem);
    margin: 1rem 2rem 0;
    padding: 0.8rem 1rem;
    font-size: 1.05rem;
  }
}
</style>
