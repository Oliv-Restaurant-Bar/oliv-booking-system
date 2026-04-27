import React from 'react';
import { DietaryIcon } from '@/components/user/DietaryIcon';

export const CATEGORY_ORDER = [
    'Apéro', 'Snacks',
    'Starter', 'Starters', 'Vorspeise', 'Vorspeisen', 
    'Main Course', 'Main Courses', 'Hauptgang', 'Hauptgänge', 'Hauptgericht', 'Hauptgerichte', 'Menü',
    'Dessert', 'Desserts', 'Nachspeise', 'Nachspeisen',
    'Add-on', 'Add-ons', 'Extra', 'Extras', 'Zusatzleistung', 'Zusatzleistungen', 'Choices',
    'Beverage', 'Beverages', 'Drink', 'Drinks', 'Getränk', 'Getränke', 'Softdrinks', 'Wein', 'Wine', 'Bier', 'Beer', 'Kaffee', 'Coffee', 'Spirituosen', 'Spirits', 'Cocktails', 'Longdrinks', 'Digestif'
];

export function parseDietaryNotes(text: string | undefined | null) {
    if (!text) return null;
    const parts = text.split(/(\(Veg\)|\(Vegan\)|\(Non-Veg\))/i);
    const result: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;

        const lowerPart = part.toLowerCase();
        const isDietary = lowerPart === '(veg)' || lowerPart === '(vegan)' || lowerPart === '(non-veg)';

        if (isDietary) {
            const type = lowerPart.replace(/[()]/g, '') as 'veg' | 'vegan' | 'non-veg';

            if (result.length > 0 && typeof result[result.length - 1] === 'string') {
                const prevText = result.pop() as string;
                const lastSeparatorIndex = Math.max(
                    prevText.lastIndexOf(':'),
                    prevText.lastIndexOf(',')
                );

                if (lastSeparatorIndex !== -1) {
                    const prefix = prevText.substring(0, lastSeparatorIndex + 1);
                    const name = prevText.substring(lastSeparatorIndex + 1).trim();

                    result.push(prefix);
                    if (name) result.push(' ');
                    result.push(<DietaryIcon key={`icon-${i}`} type={type} size="xs" />);
                    if (name) {
                        result.push(' ');
                        result.push(name);
                    }
                } else {
                    result.push(<DietaryIcon key={`icon-${i}`} type={type} size="xs" />);
                    result.push(' ');
                    result.push(prevText.trim());
                }
            } else {
                result.push(<DietaryIcon key={i} type={type} size="xs" />);
            }
        } else {
            result.push(part);
        }
    }

    return result;
}

export const getAvatarColor = (name: string) => {
    const colors = [
        '#9DAE91', // Sage
        '#E8B4B8', // Dusty Rose
        '#B8D4E8', // Sky Blue
        '#F5E6A3', // Pale Gold
        '#C9B8E8', // Lavender
        '#E8B8D4'  // Soft Pink
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};
