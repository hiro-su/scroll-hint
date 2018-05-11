import { assign } from 'es6-object-assign';
import { append, addClass, removeClass, getScrollTop, getOffset } from './util';

const defaults = {
  suggestClass: 'is-active',
  scrollableClass: 'is-scrollable',
  scrollableRightClass: 'is-right-scrollable',
  scrollableLeftClass: 'is-left-scrollable',
  scrollHintClass: 'scroll-hint',
  scrollHintIconClass: 'scroll-hint-icon',
  scrollHintIconAppendClass: 'scroll-hint-icon-white',
  scrollHintIconWrapClass: 'scroll-hint-icon-wrap',
  scrollHintText: 'scroll-hint-text',
  scrollHintBorderWidth: 10,
  enableOverflowScrolling: true,
  applyToParents: false,
  i18n: {
    scrollable: 'scrollable'
  }
};

export default class ScrollHint {
  constructor(ele, option) {
    this.opt = assign({}, defaults, option);
    this.items = [];
    const elements = typeof ele === 'string' ? document.querySelectorAll(ele) : ele;
    const { applyToParents } = this.opt;
    [].forEach.call(elements, (element) => {
      if (applyToParents) {
        element = element.parentElement;
      }
      element.style.position = 'relative';
      element.style.overflow = 'auto';
      if (this.opt.enableOverflowScrolling) {
        if ('overflowScrolling' in element.style) {
          element.style.overflowScrolling = 'touch';
        } else if ('webkitOverflowScrolling' in element.style) {
          element.style.webkitOverflowScrolling = 'touch';
        }
      }
      const item = {
        element,
        scrolledIn: false,
        interacted: false
      };
      element.addEventListener('scroll', () => {
        item.interacted = true;
        this.updateItem(item);
      });
      addClass(element, this.opt.scrollHintClass);
      append(element, `<div class="${this.opt.scrollHintIconWrapClass}" data-target="scrollable-icon">
        <span class="${this.opt.scrollHintIconClass}${this.opt.scrollHintIconAppendClass ? ` ${this.opt.scrollHintIconAppendClass}`: ''}"><div class="${this.opt.scrollHintText}">スクロールできます</div></span>
      </div>`);
      this.items.push(item);
    });
    window.addEventListener('scroll', () => {
      this.updateItems();
    });
    window.addEventListener('resize', () => {
      this.updateItems();
    });
    this.updateItems();
  }

  isScrollable(item) {
    const { element } = item;
    return element.offsetHeight === element.scrollHeight &&
    element.clientWidth < element.scrollWidth;
  }

  checkScrollableDir(item) {
    const { scrollHintBorderWidth, scrollableRightClass, scrollableLeftClass } = this.opt;
    const { element } = item;
    const child = element.children[0];
    const width = child.scrollWidth;
    const parentWidth = element.offsetWidth;
    const scrollLeft = element.scrollLeft;
    if (parentWidth + scrollLeft < width - scrollHintBorderWidth) {
      addClass(element, scrollableRightClass);
    } else {
      removeClass(element, scrollableRightClass);
    }
    if (parentWidth < width && scrollLeft > scrollHintBorderWidth) {
      addClass(element, scrollableLeftClass);
    } else {
      removeClass(element, scrollableLeftClass);
    }
  }

  needSuggest(item) {
    const { scrolledIn, interacted } = item;
    return !interacted && scrolledIn && this.isScrollable(item);
  }

  updateItems() {
    [].forEach.call(this.items, (item) => {
      this.updateItem(item);
    });
  }

  updateStatus(item) {
    const { element, scrolledIn } = item;
    if (scrolledIn) {
      return;
    }
    if (getOffset(element).top < getScrollTop() + window.innerHeight) {
      item.scrolledIn = true;
    }
  }

  updateItem(item) {
    const { opt } = this;
    const { element } = item;
    const target = element.querySelector('[data-target="scrollable-icon"]');
    this.updateStatus(item);
    if (this.isScrollable(item)) {
      addClass(element, opt.scrollableClass);
    } else {
      removeClass(element, opt.scrollableClass);
    }
    if (this.needSuggest(item)) {
      addClass(target, opt.suggestClass);
    } else {
      removeClass(target, opt.suggestClass);
    }
    this.checkScrollableDir(item);
  }
}
