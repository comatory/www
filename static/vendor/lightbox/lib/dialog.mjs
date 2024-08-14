import {
  findNextLightboxElement,
  findPreviousLightboxElement,
  parseTranslateProperty,
} from "./utils.mjs";
import { createShowEvent } from "./events.mjs";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href=${new URL("dialog.css", import.meta.url)} />
  <dialog name="dialog">
    <img id="image" />
    <button id="prev">
      ←
    </button>
    <button id="next">
      →
    </button>
    <section id="caption"></section>
    <button id="close">⨯</button>
  </dialog>
`;

const NEXT_BUTTON_CLICK_EVENT = Symbol("next-button-click");
const PREVIOUS_BUTTON_CLICK_EVENT = Symbol("previous-button-click");
const NEXT_BUTTON_KEYDOWN_EVENT = Symbol("next-button-keydown");
const PREVIOUS_BUTTON_KEYDOWN_EVENT = Symbol("previous-button-keydown");
const IMAGE_WHEEL_EVENT = Symbol("image-wheel");
const IMAGE_DOUBLE_CLICK_EVENT = Symbol("image-double-click");
const IMAGE_MOUSE_DOWN_EVENT = Symbol("image-mouse-down");
const IMAGE_MOUSE_MOVE_EVENT = Symbol("image-mouse-move");
const IMAGE_MOUSE_UP_EVENT = Symbol("image-mouse-up");

const DEFAULT_HANDLERS = Object.freeze({
  [NEXT_BUTTON_CLICK_EVENT]: { type: 'click', handler: null, element: null },
  [PREVIOUS_BUTTON_CLICK_EVENT]: { type: 'click', handler: null, element: null },
  [NEXT_BUTTON_KEYDOWN_EVENT]: { type: 'keydown', handler: null, element: null },
  [PREVIOUS_BUTTON_KEYDOWN_EVENT]: { type: 'keydown', handler: null, element: null },
  [IMAGE_WHEEL_EVENT]: { type: 'wheel', handler: null, element: null },
  [IMAGE_DOUBLE_CLICK_EVENT]: { type: 'dblclick', handler: null, element: null },
  [IMAGE_MOUSE_DOWN_EVENT]: { type: 'mousedown', handler: null, element: null },
  [IMAGE_MOUSE_MOVE_EVENT]: { type: 'mousemove', handler: null, element: null },
  [IMAGE_MOUSE_UP_EVENT]: { type: 'mouseup', handler: null, element: null },
});

export class LightboxDialog extends HTMLElement {
  #root = null;
  #dialog = null;
  #handlers = { ...DEFAULT_HANDLERS };

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const dialog = template.content.cloneNode(true);
    this.#dialog = dialog.children.namedItem('dialog')
    this.#root = this.shadowRoot.appendChild(dialog);

    // TODO: detect `open` attribute
    this.#dialog.addEventListener("close", this.close);
  }

  open = ({ image, caption, elementIds, elementId, showNavigation = true }) => {
    this.#setImage(image);
    if (caption) {
      this.#unsetCaption();
      this.#setCaption(caption);
    } else {
      this.#unsetCaption();
    }

    this.#setNavigation({ elementIds, elementId, showNavigation });
    this.#setPanAndZoom();

    if (!this.getAttribute("open")) {
      this.setAttribute("open", true);
      this.#dialog.showModal();
    }
  }

  close = () => {
    this.#resetHandlers();
    this.removeAttribute("open");
    this.#unsetCaption();
    this.#unsetImage();
  }

  #setImage(image) {
    const dialogImage = this.#dialog.children.namedItem("image");
    const clone = image.cloneNode(true);
    clone.setAttribute("id", "image");
    clone.removeAttribute("style");
    clone.removeAttribute("width");
    clone.removeAttribute("height");

    this.#dialog.replaceChild(clone, dialogImage);
  }

  #unsetImage() {
    const dialogImage = this.#dialog.children.namedItem("image");
    dialogImage.innerHTML = "";
  }

  #setCaption(caption) {
    const dialogCaption = this.#dialog.children.namedItem("caption");
    dialogCaption.append(caption.cloneNode(true));
    dialogCaption.setAttribute("enabled", "");
  }

  #unsetCaption() {
    const dialogCaption = this.#dialog.children.namedItem("caption");
    dialogCaption.innerHTML = "";
    dialogCaption.removeAttribute("enabled", "");
  }

  #addHandler({ key, type, handler, element }) {
    this.#handlers[key] = { type, handler, element };
    element.addEventListener(type, handler);
  }

  #removeHandler(key) {
    const { type, handler, element } = this.#handlers[key];
    if (element && handler) {
      element.removeEventListener(type, handler);
    }

    this.#handlers[key] = { ...DEFAULT_HANDLERS[key] };
  }

  #resetHandlers() {
    for (const key of Object.getOwnPropertySymbols(this.#handlers)) {
      this.#removeHandler(key);
    }
    this.#handlers = { ...DEFAULT_HANDLERS };
  }

  #setNavigation({ elementIds, elementId, showNavigation }) {
    const handleCloseButtonClick = () => {
      this.#dialog.close();
    }

    const closeButton = this.#dialog.children.namedItem("close");
    closeButton.addEventListener("click", handleCloseButtonClick);

    const nextElement = findNextLightboxElement(document, elementIds, elementId);
    const nextButton = this.#dialog.children.namedItem("next");
    const handleNextButtonClick = () => {
      this.#resetHandlers();
      nextElement.dispatchEvent(createShowEvent());
    }

    const handleNextButtonKeydown = (event) => {
      if (event.key !== "ArrowRight") {
        return;
      }

      this.#resetHandlers();
      nextElement.dispatchEvent(createShowEvent());
    }

    if (nextElement && showNavigation) {
      this.#addHandler({
        key: NEXT_BUTTON_CLICK_EVENT,
        type: 'click',
        handler: handleNextButtonClick,
        element: nextButton,
      });
      this.#addHandler({
        key: NEXT_BUTTON_KEYDOWN_EVENT,
        type: 'keydown',
        handler: handleNextButtonKeydown,
        element: this.#dialog,
      });
      nextButton.setAttribute("enabled", "");
    } else {
      this.#removeHandler(NEXT_BUTTON_CLICK_EVENT);
      this.#removeHandler(NEXT_BUTTON_KEYDOWN_EVENT);
      nextButton.removeAttribute("enabled");
    }

    const previousElement = findPreviousLightboxElement(document, elementIds, elementId);
    const previousButton = this.#dialog.children.namedItem("prev");
    const handlePreviousButtonClick = () => {
      this.#resetHandlers();
      previousElement.dispatchEvent(createShowEvent());
    }

    const handlePreviousButtonKeydown = (event) => {
      if (event.key !== "ArrowLeft") {
        return;
      }

      this.#resetHandlers();
      previousElement.dispatchEvent(createShowEvent());
    }

    if (previousElement && showNavigation) {
      this.#addHandler({
        key: PREVIOUS_BUTTON_CLICK_EVENT,
        type: 'click',
        handler: handlePreviousButtonClick,
        element: previousButton,
      });
      this.#addHandler({
        key: PREVIOUS_BUTTON_KEYDOWN_EVENT,
        type: 'keydown',
        handler: handlePreviousButtonKeydown,
        element: this.#dialog,
      });
      previousButton.setAttribute("enabled", "");
    } else {
      this.#removeHandler(PREVIOUS_BUTTON_CLICK_EVENT);
      this.#removeHandler(PREVIOUS_BUTTON_KEYDOWN_EVENT);
      previousButton.removeAttribute("enabled");
    }
  }

  #setPanAndZoom() {
    const image = this.#dialog.children.namedItem("image");
    let scale = NaN;
    let initialX = 0;
    let initialY = 0;
    let mouseDown = false;

    const isScaled = () => {
      return !isNaN(scale);
    }

    const handleImageWheel = (event) => {
      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      event.preventDefault();

      if (isNaN(scale)) {
        scale = 1 + event.deltaY * 0.01;
      } else {
        scale += event.deltaY * 0.01;
      }

      if (scale <= 1.0) {
        scale = NaN;
        image.style.transform = "scale(1)";
        image.style.cursor = "auto";
        return;
      }

      image.style.transform = `scale(${Math.min(scale, 5.0)})`;
      image.style.cursor = "grab";
    }

    const handleImageMouseDown = (event) => {
      if (!isScaled()) {
        return;
      }

      event.preventDefault();
      const { x, y } = parseTranslateProperty(image.style.transform);
      initialX = event.clientX - x;
      initialY = event.clientY - y;
      mouseDown = true;
    }

    const handleImageMouseMove = (event) => {
      if (!isScaled() || !mouseDown) {
        return;
      }

      event.preventDefault();
      const dx = event.clientX - initialX;
      const dy = event.clientY - initialY;
      image.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    }

    const handleImageMouseUp = (event) => {
      if (!isScaled()) {
        return;
      }

      event.preventDefault();
      mouseDown = false;
      initialX = 0;
      initialY = 0;
    }

    const handleImageDoubleClick = () => {
      image.style.transition = "transform 0.1s ease-in-out";

      if (isScaled()) {
        scale = NaN;
        initialX = 0;
        initialY = 0;
        image.style.transform = "scale(1) translate(0px, 0px)";
        image.style.cursor = "auto";
      } else {
        scale = 2.0;
        image.style.transform = "scale(2)";
        image.style.cursor = "grab";
      }

      setTimeout(() => {
        image.style.transition = "";
      }, 100);
    }

    this.#addHandler({
      key: IMAGE_WHEEL_EVENT,
      type: 'wheel',
      handler: handleImageWheel,
      element: image,
    });

    this.#addHandler({
      key: IMAGE_DOUBLE_CLICK_EVENT,
      type: 'dblclick',
      handler: handleImageDoubleClick,
      element: image,
    });

    this.#addHandler({
      key: IMAGE_MOUSE_DOWN_EVENT,
      type: 'mousedown',
      handler: handleImageMouseDown,
      element: window,
    });

    this.#addHandler({
      key: IMAGE_MOUSE_MOVE_EVENT,
      type: 'mousemove',
      handler: handleImageMouseMove,
      element: window,
    });

    this.#addHandler({
      key: IMAGE_MOUSE_UP_EVENT,
      type: 'mouseup',
      handler: handleImageMouseUp,
      element: window,
    });
  }
}
