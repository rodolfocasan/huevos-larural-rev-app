// Components/Modes/CajaMinimaEstable.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../Utils/Constants';





// Obtener dimensiones de la pantalla para responsive design
const { width: screenWidth } = Dimensions.get('window');

function CajaMinimaEstable({ businessConfig }) {
    const [precioCaja, setPrecioCaja] = useState('45');
    const [volumenEsperado, setVolumenEsperado] = useState('18');
    const [resultados, setResultados] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [tempPrecioCaja, setTempPrecioCaja] = useState('45');
    const [tempVolumenEsperado, setTempVolumenEsperado] = useState('18');

    // Calcular total de gastos semanales usando reduce con mayor precisión
    const totalGastosSemanales = Object.values(businessConfig.gastos_totales_semanales)
        .reduce((acc, current) => {
            return Math.round((acc + current) * 100) / 100; // Redondeo a 2 decimales
        }, 0);

    // Efecto para recalcular precios cuando cambien los valores
    useEffect(() => {
        calcularPrecios();
    }, [precioCaja, volumenEsperado, businessConfig]);

    // Función para formatear números a 2 decimales consistentemente
    const formatearDinero = (numero) => {
        return (Math.round(numero * 100) / 100).toFixed(2);
    };

    // Función principal de cálculo con matemática precisa
    const calcularPrecios = () => {
        const precio = Math.round(parseFloat(precioCaja || 0) * 100) / 100;
        const volumen = parseInt(volumenEsperado || 0);

        // Validar entradas
        if (precio <= 0 || volumen <= 0) {
            setResultados(null);
            return;
        }

        // Cálculos principales con precisión decimal
        const costoCompraTotal = Math.round(precio * volumen * 100) / 100;
        const costoTotalSemanal = Math.round((costoCompraTotal + totalGastosSemanales) * 100) / 100;
        const ingresosNecesarios = Math.round((costoTotalSemanal + businessConfig.ganancia_minima_semanal) * 100) / 100;
        const totalCartones = volumen * 12; // 12 cartones por caja
        const precioMinimoPorCarton = Math.round((ingresosNecesarios / totalCartones) * 100) / 100;

        // Cálculos de verificación
        const ingresoTotal = Math.round((totalCartones * precioMinimoPorCarton) * 100) / 100;
        const gananciaTotal = Math.round((ingresoTotal - costoTotalSemanal) * 100) / 100;

        // Calcular precios para diferentes cantidades
        const precios = {
            unCarton: precioMinimoPorCarton,
            mediaCaja: Math.round((precioMinimoPorCarton * 6) * 100) / 100,
            unaCaja: Math.round((precioMinimoPorCarton * 12) * 100) / 100,
            dosCarjas: Math.round((precioMinimoPorCarton * 24) * 100) / 100,
            tresCarjas: Math.round((precioMinimoPorCarton * 36) * 100) / 100,
        };

        // Calcular métricas adicionales para el informe detallado
        const margenGanancia = Math.round(((gananciaTotal / ingresoTotal) * 100) * 100) / 100;
        const costoPromedioCarton = Math.round((costoTotalSemanal / totalCartones) * 100) / 100;
        const gananciaPorCarton = Math.round((precioMinimoPorCarton - costoPromedioCarton) * 100) / 100;

        setResultados({
            costoCompraTotal,
            costoTotalSemanal,
            totalCartones,
            precioMinimoPorCarton,
            ingresoTotal,
            gananciaTotal,
            cumpleMinimo: gananciaTotal >= businessConfig.ganancia_minima_semanal,
            precios,
            margenGanancia,
            costoPromedioCarton,
            gananciaPorCarton,
            volumenCajas: volumen
        });
    };

    // Función para abrir el modal con los valores actuales
    const abrirModal = () => {
        setTempPrecioCaja(precioCaja);
        setTempVolumenEsperado(volumenEsperado);
        setModalVisible(true);
    };

    // Función para guardar los cambios
    const guardarCambios = () => {
        setPrecioCaja(tempPrecioCaja);
        setVolumenEsperado(tempVolumenEsperado);
        setModalVisible(false);
    };

    // Función para cancelar cambios
    const cancelarCambios = () => {
        setModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Sección de configuración con diseño mejorado */}
                <View style={styles.configCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>📦</Text>
                        <Text style={styles.cardTitle}>Parámetros de Compra</Text>
                    </View>

                    <View style={styles.inputGrid}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Precio por caja:</Text>
                            <View style={styles.displayValueWrapper}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <Text style={styles.displayValue}>{precioCaja}</Text>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Cajas por semana:</Text>
                            <View style={styles.displayValueWrapper}>
                                <Text style={styles.displayValue}>{volumenEsperado}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Botón para editar */}
                    <TouchableOpacity style={styles.editButton} onPress={abrirModal}>
                        <Text style={styles.editButtonIcon}>✏️</Text>
                        <Text style={styles.editButtonText}>Editar Información</Text>
                    </TouchableOpacity>

                    {/* Información contextual */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            💡 1 caja es igual a 12 cartones, 1 cartón es igual a 30 huevos
                        </Text>
                    </View>
                </View>

                {/* Modal para editar parámetros */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={cancelarCambios}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Editar Parámetros</Text>
                                <TouchableOpacity onPress={cancelarCambios} style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalContent}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Precio por caja:</Text>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.currencySymbol}>$</Text>
                                        <TextInput
                                            style={styles.currencyInput}
                                            value={tempPrecioCaja}
                                            onChangeText={setTempPrecioCaja}
                                            keyboardType="numeric"
                                            placeholder="45.00"
                                            placeholderTextColor={COLORS.textSecondary}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Cajas por semana:</Text>
                                    <TextInput
                                        style={styles.quantityInput}
                                        value={tempVolumenEsperado}
                                        onChangeText={setTempVolumenEsperado}
                                        keyboardType="numeric"
                                        placeholder="18"
                                        placeholderTextColor={COLORS.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.cancelButton} onPress={cancelarCambios}>
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={guardarCambios}>
                                    <Text style={styles.saveButtonText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Mostrar resultados solo si hay datos válidos */}
                {resultados && (
                    <>
                        {/* Sección de precios sugeridos con diseño atractivo */}
                        <View style={styles.pricesCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardIcon}>🏷️</Text>
                                <Text style={styles.cardTitle}>Precios Sugeridos</Text>
                            </View>

                            <View style={styles.pricesGrid}>
                                <View style={styles.priceCard}>
                                    <Text style={styles.priceQuantity}>1 cartón</Text>
                                    <Text style={styles.priceAmount}>${formatearDinero(resultados.precios.unCarton)}</Text>
                                    <Text style={styles.priceUnit}>30 huevos</Text>
                                </View>

                                <View style={styles.priceCard}>
                                    <Text style={styles.priceQuantity}>Media caja</Text>
                                    <Text style={styles.priceAmount}>${formatearDinero(resultados.precios.mediaCaja)}</Text>
                                    <Text style={styles.priceUnit}>6 cartones</Text>
                                </View>

                                <View style={[styles.priceCard, styles.priceCardHighlight]}>
                                    <Text style={styles.priceQuantity}>1 caja</Text>
                                    <Text style={styles.priceAmount}>${formatearDinero(resultados.precios.unaCaja)}</Text>
                                    <Text style={styles.priceUnit}>12 cartones</Text>
                                </View>

                                <View style={styles.priceCard}>
                                    <Text style={styles.priceQuantity}>2 cajas</Text>
                                    <Text style={styles.priceAmount}>${formatearDinero(resultados.precios.dosCarjas)}</Text>
                                    <Text style={styles.priceUnit}>24 cartones</Text>
                                </View>

                                <View style={styles.priceCard}>
                                    <Text style={styles.priceQuantity}>3 cajas</Text>
                                    <Text style={styles.priceAmount}>${formatearDinero(resultados.precios.tresCarjas)}</Text>
                                    <Text style={styles.priceUnit}>36 cartones</Text>
                                </View>
                            </View>
                        </View>

                        {/* Resumen financiero detallado */}
                        <View style={styles.summaryCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardIcon}>📊</Text>
                                <Text style={styles.cardTitle}>Análisis Financiero Detallado</Text>
                            </View>

                            {/* Métricas principales */}
                            <View style={styles.metricsGrid}>
                                <View style={styles.metricCard}>
                                    <Text style={styles.metricIcon}>💵</Text>
                                    <Text style={styles.metricValue}>${formatearDinero(resultados.costoCompraTotal)}</Text>
                                    <Text style={styles.metricLabel}>Costo de Compra</Text>
                                </View>

                                <View style={styles.metricCard}>
                                    <Text style={styles.metricIcon}>🏪</Text>
                                    <Text style={styles.metricValue}>${formatearDinero(totalGastosSemanales)}</Text>
                                    <Text style={styles.metricLabel}>Gastos Semanales</Text>
                                </View>

                                <View style={styles.metricCard}>
                                    <Text style={styles.metricIcon}>📦</Text>
                                    <Text style={styles.metricValue}>{resultados.totalCartones}</Text>
                                    <Text style={styles.metricLabel}>Total Cartones</Text>
                                </View>

                                <View style={styles.metricCard}>
                                    <Text style={styles.metricIcon}>🎯</Text>
                                    <Text style={[
                                        styles.metricValue,
                                        { color: resultados.cumpleMinimo ? COLORS.success : COLORS.danger }
                                    ]}>
                                        ${formatearDinero(resultados.gananciaTotal)}
                                    </Text>
                                    <Text style={styles.metricLabel}>Ganancia Proyectada</Text>
                                </View>
                            </View>

                            {/* Información adicional detallada */}
                            <View style={styles.detailsSection}>
                                <Text style={styles.detailsTitle}>Detalles del Negocio</Text>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Costo promedio por cartón:</Text>
                                    <Text style={styles.detailValue}>${formatearDinero(resultados.costoPromedioCarton)}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Ganancia por cartón:</Text>
                                    <Text style={styles.detailValue}>${formatearDinero(resultados.gananciaPorCarton)}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Margen de ganancia:</Text>
                                    <Text style={styles.detailValue}>{formatearDinero(resultados.margenGanancia)}%</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Ingresos totales esperados:</Text>
                                    <Text style={styles.detailValue}>${formatearDinero(resultados.ingresoTotal)}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Costos totales semanales:</Text>
                                    <Text style={styles.detailValue}>${formatearDinero(resultados.costoTotalSemanal)}</Text>
                                </View>
                            </View>

                            {/* Banner de estado mejorado */}
                            <View style={[
                                styles.statusBanner,
                                {
                                    backgroundColor: resultados.cumpleMinimo ?
                                        COLORS.success + '20' : COLORS.danger + '20',
                                    borderColor: resultados.cumpleMinimo ?
                                        COLORS.success : COLORS.danger
                                }
                            ]}>
                                <Text style={styles.statusIcon}>
                                    {resultados.cumpleMinimo ? '✅' : '⚠️'}
                                </Text>
                                <View style={styles.statusTextContainer}>
                                    <Text style={[
                                        styles.statusTitle,
                                        { color: resultados.cumpleMinimo ? COLORS.success : COLORS.danger }
                                    ]}>
                                        {resultados.cumpleMinimo ?
                                            '¡Meta de ganancia alcanzada!' :
                                            'Ganancia insuficiente'
                                        }
                                    </Text>
                                    <Text style={styles.statusSubtitle}>
                                        {resultados.cumpleMinimo ?
                                            `Superaste tu meta por $${formatearDinero(resultados.gananciaTotal - businessConfig.ganancia_minima_semanal)}` :
                                            `Te faltan $${formatearDinero(businessConfig.ganancia_minima_semanal - resultados.gananciaTotal)} para tu meta`
                                        }
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* Mensaje cuando no hay resultados */}
                {!resultados && (
                    <View style={styles.emptyStateCard}>
                        <Text style={styles.emptyStateIcon}>📈</Text>
                        <Text style={styles.emptyStateTitle}>Ingresa los datos arriba</Text>
                        <Text style={styles.emptyStateText}>
                            Completa el precio por caja y la cantidad de cajas para ver el análisis financiero detallado
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Estilos para tarjetas principales
    configCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    pricesCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    summaryCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },

    // Estilos para headers de tarjetas
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },

    // Estilos para inputs mejorados
    inputGrid: {
        gap: 16,
    },
    inputContainer: {
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        height: 52,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.success,
        marginRight: 8,
    },
    currencyInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        height: 52,
    },
    quantityInput: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        height: 52,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },

    // Info box
    infoBox: {
        backgroundColor: COLORS.accent + '30',
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Estilos para grid de precios
    pricesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    priceCard: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        minWidth: (screenWidth - 80) / 2,
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    priceCardHighlight: {
        backgroundColor: COLORS.accent + '40',
        borderColor: COLORS.accent,
        borderWidth: 2,
    },
    priceQuantity: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    priceAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    priceUnit: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },

    // Estilos para métricas
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    metricCard: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        minWidth: (screenWidth - 80) / 2,
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    metricIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // Sección de detalles
    detailsSection: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },

    // Banner de estado mejorado
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    statusIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },

    // Estado vacío
    emptyStateCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: 20,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    displayValueWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        height: 52,
    },
    displayValue: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },

    // Botón de editar
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accent,
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
    },
    editButtonIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },

    // Estilos del modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    modalContent: {
        padding: 20,
        gap: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        paddingTop: 0,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    saveButton: {
        flex: 1,
        backgroundColor: COLORS.success,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.card,
    },
});

export default CajaMinimaEstable;