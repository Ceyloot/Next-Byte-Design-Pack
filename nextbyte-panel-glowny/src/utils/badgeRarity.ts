/**
 * Utility functions for badge rarity styling and effects
 */

export const getRarityColor = (rarity: string) => {
  const colorMap = {
    common: 'text-gray-400 border-gray-400',
    rare: 'text-blue-400 border-blue-400',
    epic: 'text-purple-400 border-purple-400',
    legendary: 'text-yellow-400 border-yellow-400'
  };
  return colorMap[rarity as keyof typeof colorMap] || 'text-gray-400 border-gray-400';
};

export const getRarityBorder = (rarity: string) => {
  const borderMap = {
    common: 'border-gray-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400'
  };
  return borderMap[rarity as keyof typeof borderMap] || 'border-gray-400';
};

export const getRarityGlow = (rarity: string, isHovered: boolean = false, isEarned: boolean = true) => {
  if (!isEarned) return '';
  
  const glowMap = {
    common: isHovered ? 'shadow-glow-common-hover' : 'shadow-glow-common',
    rare: isHovered ? 'shadow-glow-rare-hover' : 'shadow-glow-rare',
    epic: isHovered ? 'shadow-glow-epic-hover' : 'shadow-glow-epic',
    legendary: isHovered ? 'shadow-glow-legendary-hover' : 'shadow-glow-legendary'
  };
  return glowMap[rarity as keyof typeof glowMap] || '';
};

export const getRarityAnimation = (rarity: string, isEarned: boolean = true) => {
  // Usunięto animacje - tylko statyczna poświata
  return '';
};

export const getRarityName = (rarity: string) => {
  const nameMap = {
    common: 'Zwykła',
    rare: 'Rzadka',
    epic: 'Epicka',
    legendary: 'Legendarna'
  };
  return nameMap[rarity as keyof typeof nameMap] || rarity;
};