with open("out.ts", "r") as f:
    out_content = f.read()

with open("src/data/content.ts", "r") as f:
    content_file = f.read()

# Replace the import with the actual content
content_file = content_file.replace('import { decks as generatedDecks, phrases as generatedPhrases } from "../out";\n\nexport const decks: Deck[] = generatedDecks;\nexport const phrases = generatedPhrases;', out_content)
# Add type to phrases output
content_file = content_file.replace('export const phrases: any[] = [', 'export const phrases: Phrase[] = [')
content_file = content_file.replace('export const decks: any[] = [', 'export const decks: Deck[] = [')

# Also Phrasebook interface isn't defined there anymore, let's restore it.
phrase_interface = """
export interface Phrase {
  en: string;
  ar: string;
  note?: string;
  tag?: string;
}
"""
content_file = content_file.replace('export const phrases: Phrase[] = [', phrase_interface + '\nexport const phrases: Phrase[] = [')

with open("src/data/content.ts", "w") as f:
    f.write(content_file)
