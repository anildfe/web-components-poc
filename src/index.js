import './index.scss';

class OneDialog extends HTMLElement {

    static get observedAttributes() {
        return ['open'];
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.close = this.close.bind(this);
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if(newValue !== oldValue) {
            this[attrName] = this.hasAttribute(attrName);
        }
    }

    connectedCallback() {
        const { shadowRoot } = this; 
        // const template = document.getElementById('one-dialog');
        // const node = document.importNode(template.content, true);
        shadowRoot.innerHTML = `<style>
            .wrapper {
                opacity: 0;
                transition: visibility 0s, opacity 0.25s ease-in;
            }
            .wrapper:not(.open) {
                visibility: hidden;
            }
            .wrapper.open {
                align-items: center;
                display: flex;
                justify-content: center;
                height: 100vh;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                opacity: 1;
                visibility: visible;
            }
            .overlay {
                background: rgba(0, 0, 0, 0.8);
                height: 100%;
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                width: 100%;
            }
            .dialog {
                background: #ffffff;
                max-width: 600px;
                padding: 1rem;
                position: fixed;
            }
            button {
                all: unset;
                cursor: pointer;
                font-size: 1.25rem;
                position: absolute;
                top: 1rem;
                right: 1rem;
            }
            button:focus {
                border: 2px solid blue;
            }
        </style>

        <div class="wrapper">
            <div class="overlay"></div>
            <div class="dialog" role="dialog" aria-labelledby="title" aria-describedby="content">
                <button class="close" aria-label="Close">&#x2716;&#xfe0f;</button>
                <h1 id="title"><slot name="heading"></slot></h1>
                <div id="content" class="content">
                <slot></slot>
                </div>
            </div>
        </div>`;

        shadowRoot.querySelector('button').addEventListener('click', this.close);
        shadowRoot.querySelector('.overlay').addEventListener('click', this.close);
    }
    
    disconnectedCallback() {
        this.shadowRoot.querySelector('button').removeEventListener('click', this.close);
        this.shadowRoot.querySelector('.overlay').removeEventListener('click', this.close);
    }

    get open() {
        return this.hasAttribute('open');
    }

    set open(isOpen) {
        const { shadowRoot } = this;
        shadowRoot.querySelector('.wrapper').classList.toggle('open', isOpen);
        shadowRoot.querySelector('.wrapper').setAttribute('aria-hidden', !isOpen);

        if(isOpen) {
            this._wasFocused = document.activeElement;
            this.setAttribute('open', '');
            document.addEventListener('keydown', this._watchEscape);
            this.focus();
            shadowRoot.querySelector('button').focus();
        } else {
            this._wasFocused && this._wasFocused.focus && this._wasFocused.focus();
            this.removeAttribute('open');
            document.removeEventListener('keydown', this._watchEscape);
            this.close();
        }
    }

    close() {
        if (this.open !== false) {
            this.open = false;
        }
        const closeEvent = new CustomEvent('dialog-closed');
        this.dispatchEvent(closeEvent);
    }

    _watchEscape(event) {
        if (event.key === 'Escape') {
            this.close();   
        }
    }
}

customElements.define('one-dialog', OneDialog);

const button = document.getElementById('launch-dialog');
button.addEventListener('click', () => {
    document.querySelector('one-dialog').open = true;
});