import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles, SPACING, BORDER_RADIUS } from '@/constants/Styles';
import { useThemeColor } from '@/constants/Styles';

export default function HomeScreen() {
  const globalStyles = useGlobalStyles();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={globalStyles.title}>Hello, Solar User</Text>
          <Text style={globalStyles.textSecondary}>Welcome to your Alumo dashboard</Text>
        </View>

        <View style={[globalStyles.card, styles.overviewCard]}>
          <View style={styles.overviewHeader}>
            <Text style={globalStyles.subtitle}>System Overview</Text>
            <View style={[styles.statusBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="sunny" size={32} color={primaryColor} />
              <Text style={styles.statValue}>5.2 kW</Text>
              <Text style={styles.statLabel}>Current Production</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="battery-full" size={32} color={secondaryColor} />
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Battery Status</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flash" size={32} color="#FFCA3A" />
              <Text style={styles.statValue}>24.7 kWh</Text>
              <Text style={styles.statLabel}>Today's Energy</Text>
            </View>
          </View>
        </View>

        <Text style={[globalStyles.subtitle, { marginTop: SPACING.lg }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <View style={[globalStyles.card, styles.actionCard]}>
            <Ionicons name="stats-chart" size={28} color={primaryColor} />
            <Text style={styles.actionText}>View Statistics</Text>
          </View>
          <View style={[globalStyles.card, styles.actionCard]}>
            <Ionicons name="settings" size={28} color={primaryColor} />
            <Text style={styles.actionText}>System Settings</Text>
          </View>
          <View style={[globalStyles.card, styles.actionCard]}>
            <Ionicons name="alert-circle" size={28} color={primaryColor} />
            <Text style={styles.actionText}>Alerts</Text>
          </View>
          <View style={[globalStyles.card, styles.actionCard]}>
            <Ionicons name="help-circle" size={28} color={primaryColor} />
            <Text style={styles.actionText}>Get Support</Text>
          </View>
        </View>

        <View style={[globalStyles.card, styles.tipsCard]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FFCA3A" />
            <Text style={globalStyles.subtitle}>Energy Saving Tip</Text>
          </View>
          <Text style={globalStyles.text}>
            Try running your major appliances during peak sunlight hours to maximize solar usage and minimize grid dependency.
          </Text>
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
  overviewCard: {
    marginBottom: SPACING.md,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  actionText: {
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#FFFAEB',
    marginBottom: SPACING.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
});
