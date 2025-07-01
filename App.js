// App.js
import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Header from './Components/Home/Header';
import CajaMinimaEstable from './Components/Modes/CajaMinimaEstable';
import CajaMixta from './Components/Modes/CajaMixta';
import CajasTiposParalelos from './Components/Modes/CajasTiposParalelos';

import { COLORS, DEFAULT_BUSINESS_CONFIG } from './Components/Utils/Constants';





export default function App() {
  const [selectedMode, setSelectedMode] = useState('stable');
  const [businessConfig, setBusinessConfig] = useState(DEFAULT_BUSINESS_CONFIG);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollViewRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const renderCurrentMode = () => {
    const commonProps = { businessConfig };

    switch (selectedMode) {
      case 'stable':
        return <CajaMinimaEstable {...commonProps} />;
      case 'mixed':
        return <CajaMixta {...commonProps} />;
      case 'parallel':
        return <CajasTiposParalelos {...commonProps} />;
      default:
        return <CajaMinimaEstable {...commonProps} />;
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        // Mostrar botón cuando se haya scrolleado más de 200 pixels
        setShowScrollToTop(offsetY > 200);
      },
    }
  );

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Header
            onModeSelect={setSelectedMode}
            selectedMode={selectedMode}
            businessConfig={businessConfig}
            onConfigUpdate={setBusinessConfig}
          />

          <View style={styles.modeContent}>
            {renderCurrentMode()}
          </View>
        </ScrollView>

        {/* Botón flotante para scroll hacia arriba */}
        {showScrollToTop && (
          <TouchableOpacity
            style={styles.scrollToTopButton}
            onPress={scrollToTop}
            activeOpacity={0.8}
          >
            <Text style={styles.scrollToTopIcon}>↑</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modeContent: {
    flex: 1,
    paddingBottom: 80, // Espacio extra para el botón flotante
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  scrollToTopIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});