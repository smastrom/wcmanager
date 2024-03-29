export type GoogleAPISortCriteria = 'alpha' | 'date' | 'popularity' | 'trending'

export type GoogleAPIWeights = '300' | 'regular' | '500' | '600' | '700'

export type GoogleAPIFontCateogry = 'display' | 'handwriting' | 'sans-serif' | 'serif' | 'monospace'

export interface GoogleFont {
   category: GoogleAPIFontCateogry
   family: string
   files: Record<string, string>
   kind: string
   lastModified: string
   subsets: string[]
   variants: string[]
   menu: string
}

export interface GoogleAPIResponse {
   kind: GoogleFont['kind']
   items: GoogleFont[]
}

export interface GoogleAPIResponseError {
   error: {
      code: number
      message: string
      errors: {
         message: string
         reason: string
      }[]
      status: string
      details: {
         '@type': string
         fieldViolations: { field: string; description: string }[]
      }[]
   }
}
