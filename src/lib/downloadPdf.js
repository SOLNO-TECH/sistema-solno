import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const INLINE_PROPS = [
  'color',
  'background-color',
  'background-image',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-width',
  'border-style',
  'border-radius',
  'outline-color',
  'font-size',
  'font-weight',
  'font-family',
  'font-style',
  'text-align',
  'text-decoration',
  'text-transform',
  'letter-spacing',
  'line-height',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'display',
  'flex',
  'flex-direction',
  'justify-content',
  'align-items',
  'gap',
  'grid-template-columns',
  'opacity',
  'box-shadow',
  'vertical-align',
  'white-space',
  'overflow',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'object-fit',
];

function stripUnsupportedColorFunctions(cssText) {
  return (cssText || '')
    .replace(/oklch\([^)]*\)/gi, '#666666')
    .replace(/oklab\([^)]*\)/gi, '#666666')
    .replace(/lab\([^)]*\)/gi, '#666666')
    .replace(/lch\([^)]*\)/gi, '#666666')
    .replace(/color-mix\([^)]*\)/gi, '#666666');
}

/** html2canvas no soporta oklch: quitamos hojas de estilo y usamos valores computados en rgb. */
function prepareCloneForCanvas(clonedDoc, originalRoot, clonedRoot) {
  clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((node) => node.remove());

  clonedDoc.querySelectorAll('style').forEach((node) => {
    if (/oklch|oklab|lab\(|lch\(|color-mix/i.test(node.textContent || '')) {
      node.remove();
    } else {
      node.textContent = stripUnsupportedColorFunctions(node.textContent);
    }
  });

  inlineComputedStyles(originalRoot, clonedRoot);
}

function inlineComputedStyles(original, clone) {
  if (!original || !clone) return;

  const computed = window.getComputedStyle(original);

  INLINE_PROPS.forEach((prop) => {
    const value = computed.getPropertyValue(prop);
    if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
      clone.style.setProperty(prop, value);
    }
  });

  const origChildren = original.children;
  const cloneChildren = clone.children;
  for (let i = 0; i < origChildren.length; i++) {
    inlineComputedStyles(origChildren[i], cloneChildren[i]);
  }
}

async function imageToDataUrl(src) {
  if (!src || src.startsWith('data:')) return src;
  const url = src.startsWith('http') ? src : new URL(src, window.location.origin).href;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo cargar la imagen: ${url}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function embedImages(root) {
  const images = [...root.querySelectorAll('img')];
  const backups = images.map((img) => img.getAttribute('src'));

  await Promise.all(images.map(async (img, index) => {
    try {
      const dataUrl = await imageToDataUrl(backups[index]);
      img.src = dataUrl;
      await new Promise((resolve) => {
        if (img.complete && img.naturalHeight > 0) resolve();
        else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
    } catch (err) {
      console.warn('PDF: imagen omitida', err);
    }
  }));

  return () => {
    images.forEach((img, index) => {
      if (backups[index]) img.setAttribute('src', backups[index]);
    });
  };
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function capturePageToCanvas(pageEl) {
  const width = pageEl.offsetWidth || 800;
  const height = pageEl.offsetHeight || 1035;

  return html2canvas(pageEl, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc, clonedElement) => {
      prepareCloneForCanvas(clonedDoc, pageEl, clonedElement);
    },
  });
}

async function downloadMultiPagePdf(pages, filename) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i];
    const restoreImages = await embedImages(pageEl);
    await new Promise((r) => setTimeout(r, 300));

    try {
      const canvas = await capturePageToCanvas(pageEl);
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    } finally {
      restoreImages();
    }
  }

  triggerDownload(pdf.output('blob'), filename);
  return true;
}

/**
 * Captura un elemento HTML y lo descarga como PDF (carta).
 * Si contiene `.contract-page`, genera un PDF de varias hojas.
 */
export async function downloadPdfFromElement(element, filename) {
  const pages = element.querySelectorAll('.contract-page');
  if (pages.length > 1) {
    return downloadMultiPagePdf([...pages], filename);
  }

  const restoreImages = await embedImages(element);
  await new Promise((r) => setTimeout(r, 400));

  try {
    const width = element.offsetWidth || 800;
    const height = element.offsetHeight || 1035;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedElement) => {
        prepareCloneForCanvas(clonedDoc, element, clonedElement);
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Siempre una sola hoja: escalar si el contenido es más alto que la página
    if (imgHeight > pageHeight) {
      const scale = pageHeight / imgHeight;
      const fittedWidth = imgWidth * scale;
      const xOffset = (pageWidth - fittedWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, 0, fittedWidth, pageHeight);
    } else {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    }

    triggerDownload(pdf.output('blob'), filename);
    return true;
  } finally {
    restoreImages();
  }
}

export function getQuotePdfFilename(folio) {
  const safeFolio = (folio || 'SIN-FOLIO').replace(/[^\w-]/g, '');
  return `Grupo-Solno-Cotizacion-${safeFolio}.pdf`;
}

export function getContractPdfFilename(folio) {
  const safeFolio = (folio || 'SIN-FOLIO').replace(/[^\w-]/g, '');
  return `Grupo-Solno-Contrato-${safeFolio}.pdf`;
}
