import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles, SPACING, BORDER_RADIUS } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';

export default function MonitorScreen() {
  const globalStyles = useGlobalStyles();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={globalStyles.title}>Energy Monitor</Text>
          <Text style={globalStyles.textSecondary}>Track your solar performance</Text>
        </View>

        <View style={[globalStyles.card, styles.chartCard]}>
          <Text style={globalStyles.subtitle}>Daily Production</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Chart Visualization</Text>
            <Ionicons name="bar-chart" size={60} color={primaryColor} />
          </View>
          <View style={styles.periodSelector}>
            <View style={[styles.periodOption, styles.periodActive]}>
              <Text style={styles.periodActiveText}>Day</Text>
            </View>
            <View style={styles.periodOption}>
              <Text style={styles.periodText}>Week</Text>
            </View>
            <View style={styles.periodOption}>
              <Text style={styles.periodText}>Month</Text>
            </View>
            <View style={styles.periodOption}>
              <Text style={styles.periodText}>Year</Text>
            </View>
          </View>
        </View>

        <View style={[globalStyles.card, styles.statsCard]}>
          <Text style={globalStyles.subtitle}>Energy Statistics</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Generation</Text>
              <Text style={styles.statValue}>24.7 kWh</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Grid Usage</Text>
              <Text style={styles.statValue}>3.2 kWh</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Self Consumption</Text>
              <Text style={styles.statValue}>18.3 kWh</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Battery Storage</Text>
              <Text style={styles.statValue}>6.4 kWh</Text>
            </View>
          </View>
        </View>

        <View style={[globalStyles.card, styles.performanceCard]}>
          <View style={styles.performanceHeader}>
            <Text style={globalStyles.subtitle}>System Performance</Text>
            <View style={styles.performanceIndicator}>
              <Ionicons name="checkmark-circle" size={20} color={primaryColor} />
              <Text style={styles.performanceText}>Optimal</Text>
            </View>
          </View>

          <View style={styles.performanceStats}>
            <View style={styles.performanceItem}>
              <View style={styles.performanceIconContainer}>
                <Ionicons name="sunny" size={24} color="white" style={[styles.performanceIcon, { backgroundColor: primaryColor }]} />
              </View>
              <View>
                <Text style={styles.performanceItemTitle}>Efficiency</Text>
                <Text style={styles.performanceItemValue}>94%</Text>
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <View style={styles.performanceIconContainer}>
                <Ionicons name="flash" size={24} color="white" style={[styles.performanceIcon, { backgroundColor: secondaryColor }]} />
              </View>
              <View>
                <Text style={styles.performanceItemTitle}>CO₂ Saved</Text>
                <Text style={styles.performanceItemValue}>12.3 kg</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  chartCard: {
    marginBottom: SPACING.md,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  chartPlaceholderText: {
    marginBottom: SPACING.sm,
    color: '#9E9E9E',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  periodOption: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  periodActive: {
    backgroundColor: '#289F5D',
  },
  periodText: {
    color: '#9E9E9E',
  },
  periodActiveText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsCard: {
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  statCol: {
    width: '48%',
  },
  statLabel: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  performanceCard: {
    marginBottom: SPACING.md,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  performanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceText: {
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  performanceIconContainer: {
    marginRight: SPACING.sm,
  },
  performanceIcon: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.circle,
    overflow: 'hidden',
  },
  performanceItemTitle: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  performanceItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 