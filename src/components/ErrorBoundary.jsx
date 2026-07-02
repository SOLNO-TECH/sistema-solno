import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error en la aplicación:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
          <p className="text-white font-bold text-lg mb-2">Algo salió mal</p>
          <p className="text-gray-400 text-sm mb-6 max-w-md">
            Recarga la página. Si el problema continúa, revisa la consola del navegador.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-brand text-black font-bold hover:bg-brand/90"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
