// Components/Modes/CajasTiposParalelos.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../Utils/Constants';





function CajasTiposParalelos({ businessConfig }) {
    // Estado inicial con dos tipos de huevos por defecto
    const [tiposHuevos, setTiposHuevos] = useState({
        tipo_01: { precio_compra_caja: 41, volumen_esperado: 9 },
        tipo_02: { precio_compra_caja: 45, volumen_esperado: 9 }
    });

    // Estado para los resultados calculados
    const [resultados, setResultados] = useState(null);

    // Estados para el modal de añadir tipo
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoTipoNombre, setNuevoTipoNombre] = useState('');
    const [nuevoTipoPrecio, setNuevoTipoPrecio] = useState('');
    const [nuevoTipoVolumen, setNuevoTipoVolumen] = useState('');

    // Estados para el modal de editar tipo
    const [modalEditVisible, setModalEditVisible] = useState(false);
    const [tipoEditando, setTipoEditando] = useState(null);
    const [editPrecio, setEditPrecio] = useState('');
    const [editVolumen, setEditVolumen] = useState('');

    // Calcular total de gastos semanales
    const totalGastosSemanales = Object.values(businessConfig.gastos_totales_semanales)
        .reduce((a, b) => a + b, 0);

    // Recalcular precios cuando cambian los tipos o la configuración
    useEffect(() => {
        calcularPrecios();
    }, [tiposHuevos, businessConfig]);

    // Función para actualizar un tipo específico
    const actualizarTipo = (tipo, campo, valor) => {
        setTiposHuevos(prev => ({
            ...prev,
            [tipo]: {
                ...prev[tipo],
                [campo]: parseFloat(valor) || 0
            }
        }));
    };

    // Función para eliminar un tipo
    const eliminarTipo = (tipo) => {
        // No permitir eliminar si solo hay un tipo
        if (Object.keys(tiposHuevos).length <= 1) {
            Alert.alert('Error', 'Debe mantener al menos un tipo de huevo');
            return;
        }

        Alert.alert(
            'Confirmar eliminación',
            `¿Está seguro de eliminar ${tipo.replace('_', ' ').toUpperCase()}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        const nuevosTipos = { ...tiposHuevos };
                        delete nuevosTipos[tipo];
                        setTiposHuevos(nuevosTipos);
                    }
                }
            ]
        );
    };

    // Función para abrir modal de añadir tipo
    const abrirModalAñadirTipo = () => {
        setNuevoTipoNombre('');
        setNuevoTipoPrecio('');
        setNuevoTipoVolumen('');
        setModalVisible(true);
    };

    // Función para cancelar añadir tipo
    const cancelarAñadirTipo = () => {
        setNuevoTipoNombre('');
        setNuevoTipoPrecio('');
        setNuevoTipoVolumen('');
        setModalVisible(false);
    };

    // Función para añadir nuevo tipo
    const añadirNuevoTipo = () => {
        // Validaciones
        if (!nuevoTipoNombre.trim()) {
            Alert.alert('Error', 'Ingrese un nombre para el tipo');
            return;
        }

        if (!nuevoTipoPrecio || parseFloat(nuevoTipoPrecio) <= 0) {
            Alert.alert('Error', 'Ingrese un precio válido por caja');
            return;
        }

        if (!nuevoTipoVolumen || parseFloat(nuevoTipoVolumen) <= 0) {
            Alert.alert('Error', 'Ingrese un volumen válido de cajas por semana');
            return;
        }

        // Generar clave única para el nuevo tipo
        const numeroTipo = Object.keys(tiposHuevos).length + 1;
        const claveTipo = `tipo_${numeroTipo.toString().padStart(2, '0')}`;

        // Añadir el nuevo tipo
        setTiposHuevos(prev => ({
            ...prev,
            [claveTipo]: {
                precio_compra_caja: parseFloat(nuevoTipoPrecio),
                volumen_esperado: parseFloat(nuevoTipoVolumen)
            }
        }));

        // Cerrar modal
        cancelarAñadirTipo();
    };

    // Función para abrir modal de editar tipo
    const abrirModalEditarTipo = (tipo, params) => {
        setTipoEditando(tipo);
        setEditPrecio(params.precio_compra_caja.toString());
        setEditVolumen(params.volumen_esperado.toString());
        setModalEditVisible(true);
    };

    // Función para cancelar editar tipo
    const cancelarEditarTipo = () => {
        setTipoEditando(null);
        setEditPrecio('');
        setEditVolumen('');
        setModalEditVisible(false);
    };

    // Función para guardar cambios del tipo editado
    const guardarCambiosTipo = () => {
        // Validaciones
        if (!editPrecio || parseFloat(editPrecio) <= 0) {
            Alert.alert('Error', 'Ingrese un precio válido por caja');
            return;
        }

        if (!editVolumen || parseFloat(editVolumen) <= 0) {
            Alert.alert('Error', 'Ingrese un volumen válido de cajas por semana');
            return;
        }

        // Actualizar el tipo con los nuevos valores
        setTiposHuevos(prev => ({
            ...prev,
            [tipoEditando]: {
                precio_compra_caja: parseFloat(editPrecio),
                volumen_esperado: parseFloat(editVolumen)
            }
        }));

        // Cerrar modal
        cancelarEditarTipo();
    };

    // Función principal para calcular todos los precios y resultados
    const calcularPrecios = () => {
        let resultadosPorTipo = {};
        let costoCompraTotalGeneral = 0;
        let volumenTotalCartones = 0;

        // Calcular información básica por cada tipo de huevo
        Object.entries(tiposHuevos).forEach(([tipo, params]) => {
            const costoCompraTipo = params.precio_compra_caja * params.volumen_esperado;
            const totalCartonesTipo = params.volumen_esperado * 12; // 12 cartones por caja

            costoCompraTotalGeneral += costoCompraTipo;
            volumenTotalCartones += totalCartonesTipo;

            resultadosPorTipo[tipo] = {
                precio_compra_caja: params.precio_compra_caja,
                volumen_esperado: params.volumen_esperado,
                costo_compra_tipo: costoCompraTipo,
                total_cartones_tipo: totalCartonesTipo
            };
        });

        // Calcular costo total semanal (compra + gastos)
        const costoTotalSemanal = costoCompraTotalGeneral + totalGastosSemanales;

        // Calcular margen mínimo por cartón para cubrir gastos y ganancia mínima
        const margenMinimoPorCarton = (totalGastosSemanales + businessConfig.ganancia_minima_semanal) / volumenTotalCartones;

        // Calcular precio específico para cada tipo
        Object.keys(resultadosPorTipo).forEach(tipo => {
            const costoPorCartonTipo = resultadosPorTipo[tipo].precio_compra_caja / 12;
            const precioMinimoPorCartonTipo = parseFloat((costoPorCartonTipo + margenMinimoPorCarton).toFixed(2));
            const ingresosProyectadosTipo = precioMinimoPorCartonTipo * resultadosPorTipo[tipo].total_cartones_tipo;
            const gananciaProyectadaTipo = ingresosProyectadosTipo - resultadosPorTipo[tipo].costo_compra_tipo;

            resultadosPorTipo[tipo] = {
                ...resultadosPorTipo[tipo],
                costo_por_carton_tipo: parseFloat(costoPorCartonTipo.toFixed(2)),
                precio_minimo_por_carton_tipo: precioMinimoPorCartonTipo,
                ingresos_proyectados_tipo: parseFloat(ingresosProyectadosTipo.toFixed(2)),
                ganancia_proyectada_tipo: parseFloat(gananciaProyectadaTipo.toFixed(2))
            };
        });

        // Calcular totales generales
        const gananciaNetaTotal = Object.values(resultadosPorTipo)
            .reduce((acc, tipo) => acc + tipo.ganancia_proyectada_tipo, 0) - totalGastosSemanales;

        const ingresoTotalAcumulado = Object.values(resultadosPorTipo)
            .reduce((acc, tipo) => acc + tipo.ingresos_proyectados_tipo, 0);

        // Guardar todos los resultados
        setResultados({
            resultados_por_tipo: resultadosPorTipo,
            costo_compra_total_general: parseFloat(costoCompraTotalGeneral.toFixed(2)),
            costo_total_semanal: parseFloat(costoTotalSemanal.toFixed(2)),
            volumen_total_cartones: volumenTotalCartones,
            margen_minimo_por_carton: parseFloat(margenMinimoPorCarton.toFixed(2)),
            ganancia_neta_total: parseFloat(gananciaNetaTotal.toFixed(2)),
            ingreso_total_acumulado: parseFloat(ingresoTotalAcumulado.toFixed(2)),
            cumple_minimo: gananciaNetaTotal >= businessConfig.ganancia_minima_semanal
        });
    };

    // Función para formatear números con 2 decimales
    const formatearPrecio = (numero) => {
        return `$${parseFloat(numero).toFixed(2)}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Sección de configuración de tipos */}
                <View style={styles.inputSection}>
                    {/* Título de la sección */}
                    <View style={styles.sectionTitleContainer}>
                        <Text style={styles.sectionTitle}>📦 Parámetros de compra</Text>
                    </View>

                    {/* Lista de tipos configurables */}
                    <View style={styles.tiposListContainer}>
                        {Object.entries(tiposHuevos).map(([tipo, params]) => (
                            <View key={tipo} style={styles.tipoContainer}>
                                <View style={styles.tipoHeader}>
                                    <Text style={styles.tipoTitle}>
                                        {tipo.replace('_', ' ').toUpperCase()}
                                    </Text>
                                    {Object.keys(tiposHuevos).length > 1 && (
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => eliminarTipo(tipo)}
                                        >
                                            <Text style={styles.deleteButtonText}>🗑️</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.tipoInfo}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Precio por caja:</Text>
                                        <Text style={styles.infoValue}>${params.precio_compra_caja.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Cajas por semana:</Text>
                                        <Text style={styles.infoValue}>{params.volumen_esperado}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => abrirModalEditarTipo(tipo, params)}
                                >
                                    <Text style={styles.editButtonText}>✏️ Editar Información</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* Botón para añadir nuevo tipo */}
                    <TouchableOpacity
                        style={styles.addTipoButton}
                        onPress={abrirModalAñadirTipo}
                    >
                        <Text style={styles.addTipoButtonText}>➕ Añadir Nuevo Tipo</Text>
                    </TouchableOpacity>

                    {/* Modal para editar tipo existente */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalEditVisible}
                        onRequestClose={cancelarEditarTipo}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        ✏️ Editar {tipoEditando ? tipoEditando.replace('_', ' ').toUpperCase() : ''}
                                    </Text>
                                    <TouchableOpacity onPress={cancelarEditarTipo} style={styles.closeButton}>
                                        <Text style={styles.closeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalForm}>
                                    <View style={styles.modalInputContainer}>
                                        <Text style={styles.modalInputLabel}>💰 Precio por caja</Text>
                                        <View style={styles.inputWrapper}>
                                            <Text style={styles.currencySymbol}>$</Text>
                                            <TextInput
                                                style={styles.modalCurrencyInput}
                                                placeholder="0.00"
                                                value={editPrecio}
                                                onChangeText={setEditPrecio}
                                                keyboardType="numeric"
                                                placeholderTextColor={COLORS.textSecondary}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.modalInputContainer}>
                                        <Text style={styles.modalInputLabel}>📦 Cajas por semana</Text>
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="0"
                                            value={editVolumen}
                                            onChangeText={setEditVolumen}
                                            keyboardType="numeric"
                                            placeholderTextColor={COLORS.textSecondary}
                                        />
                                    </View>
                                </View>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={cancelarEditarTipo}>
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveButton} onPress={guardarCambiosTipo}>
                                        <Text style={styles.saveButtonText}>💾 Guardar Cambios</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Información del margen aplicado */}
                    {resultados && (
                        <View style={styles.margenInfo}>
                            <Text style={styles.margenLabel}>Margen aplicado por cartón:</Text>
                            <Text style={styles.margenValue}>
                                {formatearPrecio(resultados.margen_minimo_por_carton)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Sección de resultados por tipo */}
                {resultados && (
                    <>
                        <View style={styles.resultsSection}>
                            <Text style={styles.sectionTitle}>Precios de Venta por Tipo</Text>

                            {Object.entries(resultados.resultados_por_tipo).map(([tipo, info]) => (
                                <View key={tipo} style={styles.tipoResultContainer}>
                                    <Text style={styles.tipoResultTitle}>
                                        {tipo.replace('_', ' ').toUpperCase()}
                                    </Text>

                                    {/* Desglose del cálculo */}
                                    <View style={styles.costBreakdown}>
                                        <Text style={styles.breakdownText}>
                                            💡 Cálculo: {formatearPrecio(info.costo_por_carton_tipo)} (costo) + {formatearPrecio(resultados.margen_minimo_por_carton)} (margen) = {formatearPrecio(info.precio_minimo_por_carton_tipo)}
                                        </Text>
                                    </View>

                                    {/* Lista de precios por cantidad */}
                                    <View style={styles.priceList}>
                                        <View style={styles.priceItem}>
                                            <Text style={styles.priceLabel}>🥚 1 cartón (30 huevos)</Text>
                                            <Text style={styles.priceValue}>
                                                {formatearPrecio(info.precio_minimo_por_carton_tipo)}
                                            </Text>
                                        </View>
                                        <View style={styles.priceItem}>
                                            <Text style={styles.priceLabel}>📦 Media caja (6 cartones)</Text>
                                            <Text style={styles.priceValue}>
                                                {formatearPrecio(info.precio_minimo_por_carton_tipo * 6)}
                                            </Text>
                                        </View>
                                        <View style={styles.priceItem}>
                                            <Text style={styles.priceLabel}>📦 1 caja completa (12 cartones)</Text>
                                            <Text style={styles.priceValue}>
                                                {formatearPrecio(info.precio_minimo_por_carton_tipo * 12)}
                                            </Text>
                                        </View>
                                        <View style={styles.priceItem}>
                                            <Text style={styles.priceLabel}>📦📦 2 cajas (24 cartones)</Text>
                                            <Text style={styles.priceValue}>
                                                {formatearPrecio(info.precio_minimo_por_carton_tipo * 24)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Resumen del tipo */}
                                    <View style={styles.tipoSummary}>
                                        <View style={styles.tipoSummaryItem}>
                                            <Text style={styles.tipoSummaryLabel}>📊 Cartones disponibles</Text>
                                            <Text style={styles.tipoSummaryValue}>{info.total_cartones_tipo}</Text>
                                        </View>
                                        <View style={styles.tipoSummaryItem}>
                                            <Text style={styles.tipoSummaryLabel}>💰 Ingreso proyectado</Text>
                                            <Text style={styles.tipoSummaryValue}>
                                                {formatearPrecio(info.ingresos_proyectados_tipo)}
                                            </Text>
                                        </View>
                                        <View style={styles.tipoSummaryItem}>
                                            <Text style={styles.tipoSummaryLabel}>📈 Ganancia bruta</Text>
                                            <Text style={styles.tipoSummaryValue}>
                                                {formatearPrecio(info.ganancia_proyectada_tipo)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Sección de resumen general */}
                        <View style={styles.summarySection}>
                            <Text style={styles.sectionTitle}>Resumen General Semanal</Text>

                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>🛒 Costo compra total</Text>
                                    <Text style={styles.summaryValue}>
                                        {formatearPrecio(resultados.costo_compra_total_general)}
                                    </Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>💸 Gastos operativos</Text>
                                    <Text style={styles.summaryValue}>
                                        {formatearPrecio(totalGastosSemanales)}
                                    </Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>📦 Total cartones</Text>
                                    <Text style={styles.summaryValue}>{resultados.volumen_total_cartones}</Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>💰 Ingreso total</Text>
                                    <Text style={styles.summaryValue}>
                                        {formatearPrecio(resultados.ingreso_total_acumulado)}
                                    </Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>📊 Costo total semanal</Text>
                                    <Text style={styles.summaryValue}>
                                        {formatearPrecio(resultados.costo_total_semanal)}
                                    </Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>🎯 Ganancia neta</Text>
                                    <Text style={[
                                        styles.summaryValue,
                                        { color: resultados.cumple_minimo ? COLORS.success : COLORS.danger }
                                    ]}>
                                        {formatearPrecio(resultados.ganancia_neta_total)}
                                    </Text>
                                </View>
                            </View>

                            {/* Banner de estado */}
                            <View style={[
                                styles.statusBanner,
                                { backgroundColor: resultados.cumple_minimo ? COLORS.success : COLORS.danger }
                            ]}>
                                <Text style={styles.statusText}>
                                    {resultados.cumple_minimo
                                        ? '✅ Ganancia mínima semanal cumplida'
                                        : '⚠️ Ganancia insuficiente - Ajustar precios o volumen'
                                    }
                                </Text>
                                <Text style={styles.statusSubtext}>
                                    Objetivo: {formatearPrecio(businessConfig.ganancia_minima_semanal)} semanales
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Modal para añadir nuevo tipo */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={cancelarAñadirTipo}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🥚 Nuevo Tipo de Huevo</Text>
                            <TouchableOpacity onPress={cancelarAñadirTipo} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalForm}>
                            <View style={styles.modalInputContainer}>
                                <Text style={styles.modalInputLabel}>📝 Nombre del tipo</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Ej: Huevos Premium, Huevos Orgánicos..."
                                    value={nuevoTipoNombre}
                                    onChangeText={setNuevoTipoNombre}
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>

                            <View style={styles.modalInputContainer}>
                                <Text style={styles.modalInputLabel}>💰 Precio por caja</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.currencySymbol}>$</Text>
                                    <TextInput
                                        style={styles.modalCurrencyInput}
                                        placeholder="0.00"
                                        value={nuevoTipoPrecio}
                                        onChangeText={setNuevoTipoPrecio}
                                        keyboardType="numeric"
                                        placeholderTextColor={COLORS.textSecondary}
                                    />
                                </View>
                            </View>

                            <View style={styles.modalInputContainer}>
                                <Text style={styles.modalInputLabel}>📦 Cajas por semana</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="0"
                                    value={nuevoTipoVolumen}
                                    onChangeText={setNuevoTipoVolumen}
                                    keyboardType="numeric"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelarAñadirTipo}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={añadirNuevoTipo}>
                                <Text style={styles.saveButtonText}>➕ Agregar Tipo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
// margenValue
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },

    // Estilos de secciones principales
    inputSection: {
        backgroundColor: COLORS.card,
        margin: 15,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitleContainer: {
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 15,
    },
    addButton: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Estilos de tipos de huevos
    tipoContainer: {
        marginBottom: 16,
        backgroundColor: COLORS.secondary,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tipoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    deleteButton: {
        padding: 4,
    },
    deleteButtonText: {
        fontSize: 16,
    },
    tipoInputs: {
        flexDirection: 'row',
        gap: 12,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 6,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    currencySymbol: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginRight: 4,
    },
    input: {
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        color: COLORS.text,
        fontSize: 14,
        flex: 1,
    },

    // Sección de resultados
    resultsSection: {
        backgroundColor: COLORS.card,
        margin: 15,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tipoResultContainer: {
        marginBottom: 24,
        backgroundColor: COLORS.secondary,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tipoResultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    costBreakdown: {
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    breakdownText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
    },

    // Lista de precios
    priceList: {
        gap: 2,
        marginBottom: 16,
    },
    priceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 6,
        marginBottom: 4,
    },
    priceLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        flex: 1,
    },
    priceValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
    },

    // Resumen por tipo
    tipoSummary: {
        flexDirection: 'row',
        gap: 8,
    },
    tipoSummaryItem: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    tipoSummaryLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 4,
    },
    tipoSummaryValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },

    // Sección de resumen general
    summarySection: {
        backgroundColor: COLORS.card,
        margin: 15,
        marginTop: 0,
        marginBottom: 30,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    summaryItem: {
        backgroundColor: COLORS.secondary,
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    summaryLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },

    // Banner de estado
    statusBanner: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 4,
    },
    statusSubtext: {
        color: COLORS.text,
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.9,
    },

    // Estilos del modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 18,
        color: COLORS.textSecondary,
    },
    modalForm: {
        gap: 16,
        marginBottom: 20,
    },
    modalInputContainer: {
        gap: 6,
    },
    modalInputLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    modalInput: {
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        color: COLORS.text,
        fontSize: 14,
    },
    modalCurrencyInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        padding: 12,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        flex: 1,
        backgroundColor: COLORS.success,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    tiposListContainer: {
        marginBottom: 20,
    },
    addTipoButton: {
        backgroundColor: COLORS.success,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addTipoButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    inputCurrency: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        paddingVertical: 12,
    },
    margenInfoContainer: {
        marginTop: 8,
    },
    margenInfo: {
        backgroundColor: COLORS.secondary,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    margenHeader: {
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    margenTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
    },
    margenContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 8,
    },
    margenLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    margenValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    margenDescription: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 16,
        fontStyle: 'italic',
    },
    tipoInfo: {
        backgroundColor: COLORS.primary,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    editButtonText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default CajasTiposParalelos;