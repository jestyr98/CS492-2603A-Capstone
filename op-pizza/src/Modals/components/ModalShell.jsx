function ModalShell({
  children,
  overlayClassName = 'login-modal',
  boxClassName = 'login-box',
  overlayId,
  boxId,
  ariaLabelledBy,
  boxStyle,
}) {
  return (
    <div className={overlayClassName} id={overlayId} role="presentation">
      <div
        id={boxId}
        className={boxClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        style={boxStyle}
      >
        {children}
      </div>
    </div>
  )
}

export default ModalShell
