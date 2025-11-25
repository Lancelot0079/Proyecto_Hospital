# ¿Qué es Expo?

- Expo es un framework y una plataforma de herramientas que facilita el desarrollo de aplicaciones móviles 
  multiplataforma usando JavaScript o TypeScript y React Native.
- Expo permite crear apps para Android, iOS y web sin necesidad de configurar Android Studio o Xcode manualmente.


# ¿Qué hace Expo ?

Expo se encarga de:
- Configurar automáticamente React Native (sin instalar SDKs complicados).
- Empaquetar y servir tu app con su servidor interno (Metro Bundler).
- Ejecutar la app en tiempo real en un dispositivo físico o emulador con la app Expo Go.
- Ofrecer APIs listas para usar (sin escribir código nativo en Java/Kotlin/Swift):

    Cámara (expo-camera)
    Notificaciones (expo-notifications)
    Archivos (expo-file-system)
    Sensores (expo-sensors)
    GPS, vibración, audio, etc.

| Capa                                | Descripción                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| **React Native**                    | Motor base (permite usar React para crear apps nativas).                           |
| **Expo SDK**                        | Conjunto de librerías que simplifican el acceso a funcionalidades del dispositivo. |
| **Expo CLI / Metro Bundler**        | Servidor de desarrollo que compila y sirve la app en tiempo real.                  |
| **Expo Go (App móvil)**             | App que ejecuta los proyectos sin necesidad de compilar un `.apk` o `.ipa`.        |
| **EAS (Expo Application Services)** | Servicios de compilación y publicación (para generar APK o subir a tiendas).       |








# Paso para crear el proyecto (Expo + TS) --------------------------------


# En la carpeta general del FS y los clientes (carpeta global de los proyectos):

npx create-expo-app app4_client_rn -t expo-template-blank-typescript
cd app4_client_rn


# libs  ( para navegación)
npm i @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-constants
npm i -D @types/expo__constants
npx expo install react-dom react-native-web

# Configuación en el servidor de App1
ajustar en app.py:
app.run(host="0.0.0.0", port=5000, debug=True)

# Arrancar el proyecto (posterior a las instalaciones y configuración de los archivos del proyecto)
npx expo start

- para reinicio limpio
npx expo start -c

# -------------------------------------------------------------------------

# Línea de tiempo del proyecto

- Expo procesa config → Metro prepara bundle
- index.ts → App.tsx (raíz) → src/App.tsx
- src/App.tsx → monta ProductListScreen
- ProductListScreen (en useEffect) → api.listar()
- api.ts → arma URL con app.config.ts → fetch a Flask
- Vuelven datos → setItems → render de lista + ProductItem
- Acciones de usuario → api.crear/actualizar/eliminar → recarga con cargar()

# ¿Para qué sirve cada archivo?

app.config.ts: configuración de Expo (se evalúa al iniciar). extra.API_BASE vive aquí.
index.ts: verdadero entry de la app nativa; registra el componente raíz.
App.tsx (raíz): puente que exporta ./src/App.
src/App.tsx: shell de la app (navegación, tema, contenedores).
src/screens/ProductListScreen.tsx: pantalla principal; orquesta llamadas a api, estado y UI.
src/components/ProductItem.tsx: fila editable reutilizable.
src/api.ts: capa de acceso a red; centraliza URLs, headers y manejo de errores.

# Flujo del proyecto
Expo → app.config.ts → index.ts → App.tsx → src/App.tsx
         ↓                      ↓
     inyecta API_BASE      monta ProductListScreen
                                ↓
                         llama api.ts → Flask
                                ↓
                        renderiza ProductItem.tsx
