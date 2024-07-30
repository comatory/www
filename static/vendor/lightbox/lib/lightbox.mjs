import {
  LightboxDialog,
} from "./dialog.mjs";
import {
  handleMutations,
  produceOrderedElementIds,
} from "./utils.mjs";

export class Lightbox extends HTMLElement {
  #observer = null;
  #children = null;
  #image = null;
  #caption = null;
  #root = null;
  id = "";
  navigation = true;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#createDialog();
  }

  connectedCallback() {
    this.#setOptions();

    if (this.navigation) {
      // TODO: if `id` attribute changes, make sure to reflect it
      Lightbox.#elementIds = produceOrderedElementIds(document, this, Lightbox.#elementIds);
    }

    this.#root.append(...this.children);

    this.#image = this.#findImage();
    this.#caption = this.#findCaption();

    if (this.#image) {
      this.#setHandler();
    }

    this.#applyStyles();

    this.addEventListener("wc-lightbox-show", this.#handleShowEvent);

    this.#observer = new MutationObserver(this.#onMutation);
    this.#observer.observe(this, { childList: true });

  }

  disconnectedCallback() {
    this.#observer.disconnect();


    if (this.navigation) {
      Lightbox.#elementIds.delete(this.id);
    }

    this.removeEventListener("wc-lightbox-show", this.#handleShowEvent);
  }

  static #elementIds = new Set();
  static dialog = null;

  show() {
    this.#handleClick();
  }

  #setOptions() {
    const id = this.getAttribute("id");

    if (id) {
      this.id = id;
    } else {
      const generatedId = window.crypto.randomUUID();
      this.setAttribute("id", generatedId);
      this.id = generatedId;
    }

    const navigation = this.getAttribute("navigation");

    if (navigation === "false") {
      this.navigation = false;
    }
  }
  
  #applyStyles() {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL("lightbox.css", import.meta.url);

    this.#root.prepend(style);
  }

  #onMutation = (mutations) => {
    return handleMutations(mutations, {
      sourceImage: this.#image,
      updateSourceImage: (image) => {
        this.#image = image;
        this.#setHandler();
      },
      clearSourceImage: () => {
        this.#removeHandler();
        this.#image = null;
      },
    });
  }

  #findImage() {
    return this.#root.querySelector("picture") || this.#root.querySelector("img");
  }

  #findCaption() {
    return this.#root.querySelector("figcaption");
  }

  #setHandler() {
    this.#image.addEventListener("click", this.#handleClick);
  }

  #removeHandler() {
    this.#image.removeEventListener("click", this.#handleClick);
  }

  #handleShowEvent = () => {
    this.#handleClick();
  }

  #handleClick = () => {
    Lightbox.dialog.open({
      image: this.#image,
      caption: this.#caption,
      elementIds: Lightbox.#elementIds,
      elementId: this.id,
      showNavigation: this.navigation,
    });
  }

  #createDialog() {
    // Only allow singleton for dialog
    if (window.customElements.get("wc-lightbox-dialog")) {
      return;
    }

    window.customElements.define("wc-lightbox-dialog", LightboxDialog);
    Lightbox.dialog = new LightboxDialog();
    document.body.prepend(Lightbox.dialog);
  }
}
