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
    profile: "Perfil"
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
    routes: {
      login: "/auth/login",
      register: "/auth/register",
      resetPassword: "/auth/reset-password",
      verifyEmail: "/auth/verify-email"
    },
    register: {
      title: "Crear Cuenta",
      creatingAccount: "Creando Cuenta...",
      createButton: "Crear Cuenta",
      alreadyHaveAccount: "¿Ya tienes una cuenta?",
      passwordHelperText: "La contraseña debe tener al menos 6 caracteres",
      errors: {
        passwordMismatch: "Las contraseñas no coinciden",
        passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
        emailRegistered: "Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.",
        invalidEmail: "Por favor, ingresa una dirección de correo electrónico válida.",
        invalidPassword: "La contraseña debe tener al menos 6 caracteres y contener letras y números.",
        generic: "Error al crear la cuenta. Por favor, inténtalo de nuevo."
      }
    },
    verifyEmail: {
      title: "Revisa tu Correo Electrónico",
      description: "Te hemos enviado un correo electrónico con un enlace de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para verificar tu dirección de correo electrónico.",
      spamNote: "Si no ves el correo, por favor revisa tu carpeta de spam.",
      verifying: "Verificando tu correo electrónico...",
      success: "¡Correo Electrónico Verificado Exitosamente!",
      redirecting: "Redirigiendo a la página principal...",
      status: "Estado de Verificación",
      errors: {
        expired: "El enlace de verificación ha expirado. Por favor, solicita uno nuevo.",
        generic: "Por favor, intenta iniciar sesión con tu correo electrónico y contraseña"
      },
      goToLogin: "Ir a Iniciar Sesión"
    }
  },
  scan: {
    title: "Escanear Ingredientes",
    takePhotoPrompt: "Haz clic abajo para tomar una foto",
    takePhoto: "Tomar Foto",
    scannedIngredients: "Ingredientes Escaneados",
    clearAll: "Borrar Todo",
    noIngredients: "No hay ingredientes escaneados",
    useCamera: "Usa la cámara para escanear ingredientes",
    saveIngredient: "Guardar Ingrediente",
    ingredientAdded: "ha sido añadido a tus ingredientes!",
    saveError: "Error al guardar el ingrediente",
    processingError: "Error al procesar la imagen",
    imageSizeError: "El tamaño de la imagen es demasiado grande. Por favor, usa una imagen menor a 5MB.",
    noIngredientsDetected: "No se detectaron ingredientes",
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
  },
  profile: {
    settings: "Ajustes de Perfil",
    fullName: "Nombre Completo",
    avatarUrl: "URL del Avatar",
    avatarHelp: "Ingresa una URL para tu foto de perfil",
    email: "Correo electrónico",
    updating: "Actualizando...",
    updateProfile: "Actualizar Perfil",
    updateSuccess: "¡Perfil actualizado exitosamente!",
    updateError: "Error al actualizar el perfil. Por favor, inténtalo de nuevo."
  },
  shoppingList: {
    title: 'Lista de Compras',
    addItemTitle: 'Agregar Nuevo Artículo',
    itemName: 'Nombre del Artículo',
    amount: 'Cantidad',
    unit: 'Unidad',
    addToList: 'Agregar a la Lista',
    addItem: 'Agregar Artículo',
    clearChecked: 'Eliminar Artículos Marcados',
    empty: 'Tu lista de compras está vacía',
    updateSuccess: 'Artículo actualizado con éxito',
    updateError: 'Error al actualizar el artículo',
    deleteSuccess: 'Artículo eliminado con éxito',
    deleteError: 'Error al eliminar el artículo',
    addSuccess: 'Artículo agregado con éxito',
    addError: 'Error al agregar el artículo',
  },
  ingredients: {
    title: "Mis Ingredientes",
    subtitle: "Gestiona los ingredientes de tu despensa y controla lo que tienes a mano",
    addIngredients: "Agregar Ingredientes",
    scanIngredients: "Escanear Ingredientes",
    emptyTitle: "Tu despensa está vacía",
    emptyDescription: "Comienza escaneando ingredientes para agregarlos a tu lista",
    loadError: "Error al cargar los ingredientes",
    deleteError: "Error al eliminar el ingrediente",
    units: {
      piece: "unidad",
      pieces: "unidades",
      gram: "gramo",
      grams: "gramos",
      kilogram: "kilogramo",
      kilograms: "kilogramos",
      milliliter: "mililitro",
      milliliters: "mililitros",
      liter: "litro",
      liters: "litros",
      tablespoon: "cucharada",
      tablespoons: "cucharadas",
      teaspoon: "cucharadita",
      teaspoons: "cucharaditas",
      cup: "taza",
      cups: "tazas",
      pound: "libra",
      pounds: "libras",
      ounce: "onza",
      ounces: "onzas",
    },
  },
} as const; 