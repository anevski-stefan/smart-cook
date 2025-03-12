export const de = {
  common: {
    welcome: "Willkommen bei Smart Cook",
    search: "Suchen",
    loading: "Laden...",
    error: "Ein Fehler ist aufgetreten",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    signIn: "Anmelden",
    signOut: "Abmelden",
    signUp: "Registrieren",
    email: "E-Mail",
    password: "Passwort",
    forgotPassword: "Passwort vergessen?",
    noAccount: "Noch kein Konto?",
    noResults: "Keine Ergebnisse gefunden",
  },
  navigation: {
    home: "Startseite",
    recipes: "Rezepte",
    favorites: "Favoriten",
    settings: "Einstellungen",
    scan: "Scannen",
    shoppingList: "Einkaufsliste",
    savedRecipes: "Gespeicherte Rezepte",
  },
  recipe: {
    ingredients: "Zutaten",
    instructions: "Anleitung",
    servings: "Portionen",
    prepTime: "Vorbereitungszeit",
    cookTime: "Kochzeit",
    difficulty: "Schwierigkeitsgrad",
    categories: "Kategorien",
    noMoreRecipes: "Keine weiteren Rezepte zum Laden",
    noRecipesFound: "Keine Rezepte gefunden. Versuchen Sie andere Filter.",
    findRecipes: "Rezepte finden",
  },
  cooking: {
    start: "Kochen Starten",
    pause: "Pause",
    resume: "Fortsetzen",
    finish: "Beenden",
    timer: "Timer",
    nextStep: "Nächster Schritt",
    previousStep: "Vorheriger Schritt",
  },
  home: {
    subtitle: "Ihr KI-gesteuerter Kochassistent, der Ihnen hilft, Rezepte zu entdecken, Zutaten zu verwalten und mit Selbstvertrauen zu kochen.",
    features: {
      search: {
        title: "Intelligente Rezeptsuche",
        description: "Finden Sie Rezepte, die zu Ihren Vorlieben, Ernährungseinschränkungen und verfügbaren Zutaten passen.",
        button: "Rezepte finden"
      },
      scanner: {
        title: "Zutaten-Scanner",
        description: "Nutzen Sie Ihre Kamera, um Zutaten zu scannen und sofortige Rezeptvorschläge zu erhalten.",
        button: "Jetzt Scannen"
      },
      management: {
        title: "Zutatenverwaltung",
        description: "Behalten Sie Ihre Vorräte im Blick und erhalten Sie Benachrichtigungen, wenn Artikel zur Neige gehen.",
        button: "Zutaten verwalten"
      },
      shopping: {
        title: "Einkaufsliste",
        description: "Erstellen Sie automatisch Einkaufslisten aus Rezepten und verwalten Sie Ihren Einkaufsbedarf.",
        button: "Liste anzeigen"
      },
      collection: {
        title: "Rezeptsammlung",
        description: "Speichern Sie Ihre Lieblingsrezepte und organisieren Sie sie für schnellen Zugriff.",
        button: "Meine Rezepte"
      },
      assistant: {
        title: "Kochassistent",
        description: "Erhalten Sie Schritt-für-Schritt-Anleitungen und intelligente Timer während des Kochens.",
        button: "Kochen starten"
      }
    }
  },
  auth: {
    signInPrompt: "Anmelden für Zugriff auf den Kochassistenten",
    signInDescription: "Bitte melden Sie sich an, um den Kochassistenten und die Kamerafunktionen zu nutzen.",
    signingIn: "Anmeldung läuft...",
    signInButton: "Anmelden",
    signUpLink: "Registrieren",
    resetPassword: "Passwort zurücksetzen",
  },
  scan: {
    noIngredients: "Keine Zutaten gescannt",
    useCamera: "Verwenden Sie die Kamera zum Scannen von Zutaten",
  },
  search: {
    searchRecipes: "Rezepte suchen",
    cuisine: "Küche",
    diet: "Ernährung",
    filters: "Filter",
    filterRecipes: "Rezepte filtern",
    cookingTime: "Kochzeit (Minuten)",
    complexity: "Schwierigkeitsgrad",
    mealType: "Mahlzeitenart",
    dietaryPreferences: "Ernährungsvorlieben",
    noMoreRecipes: "Keine weiteren Rezepte zum Laden",
    noRecipesFound: "Keine Rezepte gefunden. Versuchen Sie andere Suchbegriffe oder Filter.",
    enterSearchTerm: "Geben Sie einen Suchbegriff ein, um Rezepte zu finden",
    minutes: "min",
    hours: {
      one: "h",
      plus: "h+"
    },
    mealTypes: {
      breakfast: "Frühstück",
      lunch: "Mittagessen",
      dinner: "Abendessen",
      dessert: "Dessert",
      snack: "Snack",
      appetizer: "Vorspeise"
    },
    dietaryOptions: {
      vegetarian: "Vegetarisch",
      vegan: "Vegan",
      glutenFree: "Glutenfrei",
      dairyFree: "Laktosefrei",
      lowCarb: "Low-Carb",
      keto: "Keto"
    },
    complexityLevels: {
      easy: "Einfach",
      medium: "Mittel",
      hard: "Schwer"
    }
  }
} as const; 