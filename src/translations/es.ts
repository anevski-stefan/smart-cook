export const es = {
  common: {
    welcome: "Bienvenido a Smart Cook",
    search: "Buscar",
    loading: "Cargando...",
    error: "Se produjo un error",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión",
    signUp: "Registrarse",
    email: "Correo electrónico",
    password: "Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    noAccount: "¿No tienes una cuenta?",
    noResults: "No se encontraron resultados",
  },
  navigation: {
    home: "Inicio",
    recipes: "Recetas",
    favorites: "Favoritos",
    settings: "Ajustes",
    scan: "Escanear",
    shoppingList: "Lista de Compras",
    savedRecipes: "Recetas Guardadas",
  },
  recipe: {
    ingredients: "Ingredientes",
    instructions: "Instrucciones",
    servings: "Porciones",
    prepTime: "Tiempo de Preparación",
    cookTime: "Tiempo de Cocción",
    difficulty: "Dificultad",
    categories: "Categorías",
    noMoreRecipes: "No hay más recetas para cargar",
    noRecipesFound: "No se encontraron recetas. Prueba con otros filtros.",
    findRecipes: "Buscar Recetas",
  },
  cooking: {
    start: "Empezar a Cocinar",
    pause: "Pausar",
    resume: "Continuar",
    finish: "Terminar",
    timer: "Temporizador",
    nextStep: "Siguiente Paso",
    previousStep: "Paso Anterior",
  },
  home: {
    subtitle: "Tu asistente de cocina con IA que te ayuda a descubrir recetas, gestionar ingredientes y cocinar con confianza.",
    features: {
      search: {
        title: "Búsqueda Inteligente de Recetas",
        description: "Encuentra recetas que coincidan con tus preferencias, restricciones dietéticas e ingredientes disponibles.",
        button: "Buscar Recetas"
      },
      scanner: {
        title: "Escáner de Ingredientes",
        description: "Usa tu cámara para escanear ingredientes y obtener sugerencias instantáneas de recetas.",
        button: "Escanear Ahora"
      },
      management: {
        title: "Gestión de Ingredientes",
        description: "Mantén un registro de tu despensa y recibe notificaciones cuando los productos se estén agotando.",
        button: "Gestionar Ingredientes"
      },
      shopping: {
        title: "Lista de Compras",
        description: "Genera automáticamente listas de compras a partir de recetas y gestiona tus necesidades de compra.",
        button: "Ver Lista"
      },
      collection: {
        title: "Colección de Recetas",
        description: "Guarda tus recetas favoritas y organízalas para un acceso rápido.",
        button: "Mis Recetas"
      },
      assistant: {
        title: "Asistente de Cocina",
        description: "Obtén guía paso a paso y temporizadores inteligentes mientras cocinas tus comidas.",
        button: "Empezar a Cocinar"
      }
    }
  },
  auth: {
    signInPrompt: "Inicia sesión para acceder al Asistente de Cocina",
    signInDescription: "Por favor, inicia sesión para usar el asistente de cocina y las funciones de la cámara.",
    signingIn: "Iniciando sesión...",
    signInButton: "Iniciar Sesión",
    signUpLink: "Registrarse",
    resetPassword: "Restablecer contraseña",
  },
  scan: {
    noIngredients: "No hay ingredientes escaneados",
    useCamera: "Usa la cámara para escanear ingredientes",
  },
  search: {
    searchRecipes: "Buscar Recetas",
    cuisine: "Cocina",
    diet: "Dieta",
    filters: "Filtros",
    filterRecipes: "Filtrar Recetas",
    cookingTime: "Tiempo de Cocción (minutos)",
    complexity: "Dificultad",
    mealType: "Tipo de Comida",
    dietaryPreferences: "Preferencias Dietéticas",
    noMoreRecipes: "No hay más recetas para cargar",
    noRecipesFound: "No se encontraron recetas. Prueba con otros términos de búsqueda o filtros.",
    enterSearchTerm: "Ingresa un término de búsqueda para encontrar recetas",
    minutes: "min",
    hours: {
      one: "h",
      plus: "h+"
    },
    mealTypes: {
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      dessert: "Postre",
      snack: "Merienda",
      appetizer: "Aperitivo"
    },
    dietaryOptions: {
      vegetarian: "Vegetariano",
      vegan: "Vegano",
      glutenFree: "Sin Gluten",
      dairyFree: "Sin Lácteos",
      lowCarb: "Bajo en Carbohidratos",
      keto: "Keto"
    },
    complexityLevels: {
      easy: "Fácil",
      medium: "Medio",
      hard: "Difícil"
    }
  }
} as const; 