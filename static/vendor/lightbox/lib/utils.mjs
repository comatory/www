/**
 * @callback UpdateSourceImageCallback
 * @param {HTMLImageElement} sourceImage - Source image element
 * @returns {void}
 *
 * @callback ClearSourceImageCallback
 * @returns {void}
 *
 * @typedef {Object} ObserverCallbackOptions
 * @property {HTMLImageElement} sourceImage - Source image element
 * @property {UpdateSourceImageCallback} updateSourceImage - Updates source image with newly added image
 * @property {ClearSourceImageCallback} clearSourceImage - Clears source image
*/

/**
 *
 * Observer mutation callback that handles added or removed source images.
 * 
 * @param {MutationRecord[]} mutations - Array of mutation records
 * @param {ObserverCallbackOptions} options - Options object
 * @returns {void}
 */
export function handleMutations(mutations, {
  sourceImage,
  updateSourceImage,
  clearSourceImage,
}) {
  for (const mutation of mutations) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      const possibleImage = mutation.addedNodes[0];

      if (possibleImage instanceof HTMLImageElement) {
        if (sourceImage) {
          clearSourceImage();
        }
        updateSourceImage(possibleImage)
        break;
      }
    } else if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
      const possibleImage = mutation.removedNodes[0];

      if (possibleImage === sourceImage) {
        clearSourceImage();
        break;
      }
    }
  }
}

/**
 * Find all lightbox elements in the root element.
 *
 * @param {Document} root - Root element to search for lightbox elements
 * @returns {NodeListOf<Element>} - List of lightbox elements
 */
function findAllLightboxElements(root) {
  return root.querySelectorAll("wc-lightbox");
}

/**
 * Get the index of the lightbox element in the root element.
 *
 * @param {Document} root - Root element to search for lightbox elements
 * @param {HTMLElement} lightboxElement - Lightbox element to find index of
 * @returns {number} - Index of the lightbox element
 */
function getLightboxElementIndex(root, lightboxElement) {
  return Array.from(findAllLightboxElements(root)).indexOf(lightboxElement);
}

/**
 * Produce a new set of ordered lightbox element ids
 * based on DOM position
 *
 * @param {Document} root - Root element to search for lightbox elements
 * @param {HTMLElement} currentElement - Current lightbox element
 * @param {Set<string>} ids - Set of lightbox element ids
 * @returns {Set<string>} - Ordered set of lightbox element ids
 */
export function produceOrderedElementIds(root, currentElement, ids) {
  const elementIndex = getLightboxElementIndex(root, currentElement);

  const elementIds = Array.from(ids);
  const orderedElementIds = [
    ...elementIds.slice(0, elementIndex),
    currentElement.id,
    ...elementIds.slice(elementIndex + 1),
  ]

  return new Set(orderedElementIds);
}

/**
 * Return next lightbox element found in root.
 *
 * @param {HTMLDocument} root - Root element to search for lightbox elements
 * @param {Set<string>} ids - Set of lightbox element ids
 * @param {string} id - Id of the current lightbox element
 * @returns {(HTMLElement | null)} - Next lightbox element if found
*/
export function findNextLightboxElement(root, ids, id) {
  const index = getCurrentLightboxElementIndex(ids, id);
  const nextElementId = Array.from(ids)[index + 1];

  return root.getElementById(nextElementId) ?? null;
}

/**
 * Return previous lightbox element found in root.
 *
 * @param {HTMLDocument} root - Root element to search for lightbox elements
 * @param {Set<string>} ids - Set of lightbox element ids
 * @param {string} id - Id of the current lightbox element
 * @returns {(HTMLElement | null)} - Previous lightbox element if found
*/
export function findPreviousLightboxElement(root, ids, id) {
  const index = getCurrentLightboxElementIndex(ids, id);
  const previousElementId = Array.from(ids)[index - 1];

  return root.getElementById(previousElementId) ?? null;
}

/**
 * Return the index of the current lightbox element in the array of lightbox elements.
 *
 * @param {Set<string>} ids - Set of lightbox element ids
 * @param {string} id - Id of the current lightbox element
 * @returns {number} - Index of the current lightbox element
*/
function getCurrentLightboxElementIndex(ids, id) {
  return Array.from(ids).indexOf(id);
}

const TRANSLATE_PROPERTY_RE = /-?\d+\.?\d*(?=px)/g;

/**
 * Parse translate style property to get x and y values.
 * With fallback to 0
 *
 * @param {string} transform - Transform style property
 * @returns {{x: number, y: number}} - Object with x and y values
 */
export function parseTranslateProperty(transform) {
  const matches = transform.match(TRANSLATE_PROPERTY_RE);

  return {
    x: Number(matches?.[0] ?? 0),
    y: Number(matches?.[1] ?? 0),
  };
}
