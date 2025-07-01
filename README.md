# Huevos La Rural - REV App





## Instalación de dependencias
- Clonación de proyecto:
```bash
git clone https://github.com/rodolfocasan/huevos-larural-rev-app.git
```
```bash
cd huevos-larural-rev-app
```

- Instalación de dependencias:
```bash
npm install
```

- Ejecutar proyecto en modo desarrollo:
```bash
npx expo start
```





## Compilación de proyecto (Usando Expo)
- Instalación de EAS:
```bash
npm install -g eas-cli
```

- Iniciar sesión con Expo Account:
```bash
eas login
```

- Inicializar configuración de EAS en el proyecto:
```bash
eas build:configure
```

- Compilar el proyecto en .APK (usando los servidores de Expo):
```bash
eas build --platform android --profile preview
```

- Compilar el proyecto en .AAB (usando los servidores de Expo):
```bash
eas build --platform android
```





## Compilación de proyecto (Localmente)
- Instalación de EAS:
```bash
npm install -g eas-cli
```

- Iniciar sesión con Expo Account:
```bash
eas login
```

- Inicializar configuración de EAS en el proyecto:
```bash
eas build:configure
```

- Convertir Expo Managed a un proyecto React Native nativo (bare workflow):
```bash
npx expo prebuild --platform android
```

El comando anterior deberá generar la carpeta 'android', esta debe ser abierta desde Android Studio para poder trabajar con ella (compilar en .aab, .apk, etc).
