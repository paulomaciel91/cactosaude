
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center text-center p-4">
      <h1 className="text-9xl font-extrabold text-primary tracking-tighter">404</h1>
      <div className="bg-gray-800 text-white px-3 py-1 text-sm font-semibold rounded-md rotate-[-6deg] absolute mt-[-20px]">
        Página ou Loja Não Encontrada
      </div>
      <p className="text-xl text-gray-600 max-w-md mt-8 mb-8">
        Oops! A loja que você está procurando não existe ou a página foi movida.
      </p>
      <Link
        to="/"
        className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary-dark transition-colors"
      >
        Voltar para o Início
      </Link>
    </div>
  );
};

export default NotFoundPage;