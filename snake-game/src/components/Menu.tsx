import React, { useState } from 'react';

interface MenuProps {
  setPlayerId: (id: number) => void;
}

const Menu: React.FC<MenuProps> = ({ setPlayerId }) => {
  const [pseudo, setPseudo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pseudo.trim() === '') return;

    try {
      const response = await fetch('http://localhost:4000/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo }),
      });
      const data = await response.json();
      if (data.player_id) {
        setPlayerId(data.player_id);
      } else {
        alert('Erreur lors de la création du joueur.');
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <div>
      <h1>Bienvenue dans le Snake Game</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Entrez votre pseudo :
          <input value={pseudo} onChange={e => setPseudo(e.target.value)} />
        </label>
        <button type="submit">Jouer</button>
      </form>
    </div>
  );
};

export default Menu;