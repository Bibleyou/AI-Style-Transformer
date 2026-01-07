
export enum ClothingStyle {
  URBAN = 'Casual Urbano (Moletom, Cropped, Jeans)',
  INFLUENCER = 'Estilo Influenciador (Vestido, Blazer)',
  SPORTY = 'Esportivo (Legging, Top Esportivo)',
  VIRAL = 'Mix de Cores e Tendências Virais'
}

export enum MusicalStyle {
  NONE = 'Nenhum / Estilo Livre',
  SERTANEJO = 'Sertanejo (Bota, Fivela, Chapéu)',
  VAQUEJADA = 'Vaquejada (Jeans, Botas, Couro)',
  FUNK = 'Funk (Ouro, Grife, Óculos Juliet)',
  ROCK = 'Rock / Alternativo',
  KPOP = 'K-Pop Aesthetic'
}

export enum Scenario {
  ROOM = 'Quarto Moderno / Hotel',
  STREET = 'Rua Urbana Estilizada',
  STUDIO = 'Estúdio com Iluminação TikTok',
  BOKEH = 'Fundo Desfocado (Bokeh)',
  FESTIVAL = 'Festival de Música / Palco'
}

export enum Pose {
  DANCE = 'Pose de Dança Expressiva',
  SMILE = 'Sorriso e Olhar para Câmera',
  HAIR = 'Movimento de Cabelo',
  SITTING = 'Sentada / Descontraída'
}

export interface TransformationConfig {
  style: ClothingStyle;
  musicalStyle: MusicalStyle;
  scenario: Scenario;
  pose: Pose;
  accessories: string[];
}
