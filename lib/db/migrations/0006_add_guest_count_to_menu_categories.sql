-- Migration: Add guest_count column to menu_categories table
-- This allows certain categories to have manual guest count selection per item
ALTER TABLE "menu_categories" ADD COLUMN "guest_count" boolean DEFAULT false NOT NULL;
