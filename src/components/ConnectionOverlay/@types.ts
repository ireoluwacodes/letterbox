export interface IConnectionOverlayProps {
  showPaused: boolean
  /** Spinner while reconnecting */
  showReconnect: boolean
  /** After 30s failed reconnect */
  showLost: boolean
  pauseMessage?: string
  onRetry?: () => void
}
