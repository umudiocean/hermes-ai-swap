// Web3Modal custom element type declarations
declare namespace JSX {
  interface IntrinsicElements {
    'w3m-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'w3m-modal': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'w3m-wallet-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}