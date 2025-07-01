// Components/Home/Header.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../Utils/Constants';





export default function Header({ onModeSelect, selectedMode, businessConfig, onConfigUpdate }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [addGastoModalVisible, setAddGastoModalVisible] = useState(false);
    const [tempConfig, setTempConfig] = useState(businessConfig);
    const [nuevoGastoNombre, setNuevoGastoNombre] = useState('');
    const [nuevoGastoCantidad, setNuevoGastoCantidad] = useState('');

    const modes = [
        { id: 'stable', name: 'Caja Mínima Estable', icon: '📊' },
        { id: 'mixed', name: 'Caja Mixta', icon: '🔄' },
        { id: 'parallel', name: 'Cajas Paralelas', icon: '⚡' }
    ];

    const abrirModal = () => {
        setTempConfig(businessConfig);
        setModalVisible(true);
    };

    const guardarConfiguracion = () => {
        onConfigUpdate(tempConfig);
        setModalVisible(false);
    };

    const cancelarConfiguracion = () => {
        setTempConfig(businessConfig);
        setModalVisible(false);
    };

    const actualizarGananciaMinimaeSemanal = (valor) => {
        setTempConfig(prev => ({
            ...prev,
            ganancia_minima_semanal: parseFloat(valor) || 0
        }));
    };

    const actualizarGasto = (nombre, valor) => {
        setTempConfig(prev => ({
            ...prev,
            gastos_totales_semanales: {
                ...prev.gastos_totales_semanales,
                [nombre]: parseFloat(valor) || 0
            }
        }));
    };

    const eliminarGasto = (nombre) => {
        const nuevosGastos = { ...tempConfig.gastos_totales_semanales };
        delete nuevosGastos[nombre];
        setTempConfig(prev => ({
            ...prev,
            gastos_totales_semanales: nuevosGastos
        }));
    };

    const abrirModalAgregarGasto = () => {
        setAddGastoModalVisible(true);
    };

    const cancelarAgregarGasto = () => {
        setNuevoGastoNombre('');
        setNuevoGastoCantidad('');
        setAddGastoModalVisible(false);
    };

    const agregarGasto = () => {
        if (!nuevoGastoNombre.trim()) {
            Alert.alert('Error', 'Ingrese un nombre para el gasto');
            return;
        }
        if (!nuevoGastoCantidad || parseFloat(nuevoGastoCantidad) <= 0) {
            Alert.alert('Error', 'Ingrese una cantidad válida');
            return;
        }
        setTempConfig(prev => ({
            ...prev,
            gastos_totales_semanales: {
                ...prev.gastos_totales_semanales,
                [nuevoGastoNombre.trim()]: parseFloat(nuevoGastoCantidad)
            }
        }));
        setNuevoGastoNombre('');
        setNuevoGastoCantidad('');
        setAddGastoModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.configButton} onPress={abrirModal}>
                            <Text style={styles.configIcon}>⚙️</Text>
                        </TouchableOpacity>
                        <Text style={styles.appName}>REV App</Text>
                        <View style={styles.placeholder} />
                    </View>
                    <View style={styles.modeSelector}>
                        {modes.map((mode) => (
                            <TouchableOpacity
                                key={mode.id}
                                style={[
                                    styles.modeButton,
                                    selectedMode === mode.id && styles.modeButtonActive
                                ]}
                                onPress={() => onModeSelect(mode.id)}
                            >
                                <Text style={styles.modeIcon}>{mode.icon}</Text>
                                <Text style={[
                                    styles.modeButtonText,
                                    selectedMode === mode.id && styles.modeButtonTextActive
                                ]}>
                                    {mode.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </SafeAreaView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={cancelarConfiguracion}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}> Configuración</Text>
                            <TouchableOpacity onPress={cancelarConfiguracion} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Ganancia Objetivo:</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Ganancia Mínima Semanal</Text>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.currencySymbol}>$</Text>
                                        <TextInput
                                            style={styles.currencyInput}
                                            value={tempConfig.ganancia_minima_semanal.toString()}
                                            onChangeText={actualizarGananciaMinimaeSemanal}
                                            keyboardType="numeric"
                                            placeholder="0.00"
                                            placeholderTextColor={COLORS.textSecondary}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.gastosHeader}>
                                    <Text style={styles.sectionTitle}>Gastos Semanales:</Text>
                                    <TouchableOpacity style={styles.addGastoButton} onPress={abrirModalAgregarGasto}>
                                        <Text style={styles.addGastoButtonText}>(+) Añadir Gasto</Text>
                                    </TouchableOpacity>
                                </View>
                                {Object.entries(tempConfig.gastos_totales_semanales).map(([nombre, cantidad]) => (
                                    <View key={nombre} style={styles.gastoCard}>
                                        <View style={styles.gastoHeader}>
                                            <Text style={styles.gastoNombre}>{nombre}</Text>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => eliminarGasto(nombre)}
                                            >
                                                <Text style={styles.deleteButtonText}>🗑️</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.inputWrapper}>
                                            <Text style={styles.currencySymbol}>$</Text>
                                            <TextInput
                                                style={styles.currencyInput}
                                                value={cantidad.toString()}
                                                onChangeText={(valor) => actualizarGasto(nombre, valor)}
                                                keyboardType="numeric"
                                                placeholder="0.00"
                                                placeholderTextColor={COLORS.textSecondary}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelarConfiguracion}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={guardarConfiguracion}>
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={addGastoModalVisible}
                onRequestClose={cancelarAgregarGasto}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.addGastoModalContent}>
                        <View style={styles.addGastoModalHeader}>
                            <Text style={styles.addGastoModalTitle}>➕ Nuevo Gasto</Text>
                            <TouchableOpacity onPress={cancelarAgregarGasto} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.addGastoForm}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Nombre del Gasto</Text>
                                <TextInput
                                    style={styles.addGastoInput}
                                    placeholder="Ej: Combustible, Mantenimiento..."
                                    value={nuevoGastoNombre}
                                    onChangeText={setNuevoGastoNombre}
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Cantidad Semanal</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.currencySymbol}>$</Text>
                                    <TextInput
                                        style={styles.currencyInput}
                                        placeholder="0.00"
                                        value={nuevoGastoCantidad}
                                        onChangeText={setNuevoGastoCantidad}
                                        keyboardType="numeric"
                                        placeholderTextColor={COLORS.textSecondary}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.addGastoModalFooter}>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelarAgregarGasto}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={agregarGasto}>
                                <Text style={styles.saveButtonText}>➕ Agregar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.background,
    },
    safeArea: {
        backgroundColor: COLORS.primary,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.primary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    configButton: {
        backgroundColor: COLORS.accent,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    configIcon: {
        fontSize: 18,
    },
    appName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        letterSpacing: 1,
    },
    placeholder: {
        width: 40,
    },
    modeSelector: {
        flexDirection: 'row',
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 4,
    },
    modeButton: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 0,
    },
    modeButtonActive: {
        backgroundColor: COLORS.accent,
        elevation: 2,
    },
    modeIcon: {
        fontSize: 14,
        marginBottom: 4,
    },
    modeButtonText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 12,
    },
    modeButtonTextActive: {
        color: COLORS.text,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        width: '92%',
        maxHeight: '85%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
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
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalScroll: {
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 15,
        height: 50,
    },
    currencySymbol: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    currencyInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    gastosHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addGastoButton: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addGastoButtonText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: 'bold',
    },
    gastoCard: {
        backgroundColor: COLORS.secondary,
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gastoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    gastoNombre: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    deleteButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        fontSize: 14,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    cancelButton: {
        backgroundColor: COLORS.danger,
        padding: 15,
        borderRadius: 12,
        flex: 0.45,
        alignItems: 'center',
        elevation: 2,
    },
    cancelButtonText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: COLORS.success,
        padding: 15,
        borderRadius: 12,
        flex: 0.45,
        alignItems: 'center',
        elevation: 2,
    },
    saveButtonText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    addGastoModalContent: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        width: '90%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    addGastoModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    addGastoModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addGastoForm: {
        padding: 20,
    },
    addGastoInput: {
        backgroundColor: COLORS.secondary,
        color: COLORS.text,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 16,
    },
    addGastoModalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
});