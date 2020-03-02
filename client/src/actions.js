const autoAdjustHeight = node => {
  const adjustHeight = elem => {
    elem.style.height = '0';
    elem.style.height =
      ~~(elem.scrollHeight + parseInt(window.getComputedStyle(elem).getPropertyValue('font-size')) * 1.3) + 'px';
  }
  const handleInput = () => adjustHeight(node);
  setTimeout(() => adjustHeight(node), 0);
  node.addEventListener('input', handleInput);
  return {
    destroy() { node.removeEventListener('input', handleInput); }
  }
}

export {
  autoAdjustHeight
}
