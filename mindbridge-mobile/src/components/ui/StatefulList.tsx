import React, { ReactElement } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { Typography } from './Typography';
import { AlertCircle, FileQuestion, RefreshCw } from 'lucide-react-native';

export interface StatefulListProps<T> extends Omit<FlatListProps<T>, 'data'> {
  /** The generic data array */
  data: T[] | null | undefined;
  
  /** Indicates initial fetching */
  isLoading: boolean;
  
  /** Indicates fetching the next page */
  isFetchingNextPage?: boolean;
  
  /** Error object if the request failed */
  error?: Error | null;
  
  /** Function to retry the initial fetch */
  onRetry?: () => void;
  
  /** Function triggered on pull-to-refresh */
  onRefresh?: () => void;
  
  /** Indicates background refreshing state */
  isRefreshing?: boolean;
  
  /** Custom Skeleton component rendered during initial load */
  LoadingComponent?: ReactElement;
  
  /** Custom Empty State component rendered when data is empty */
  EmptyComponent?: ReactElement;
  
  /** Optional title for the default empty state */
  emptyTitle?: string;
  
  /** Optional subtitle for the default empty state */
  emptyMessage?: string;
  
  /** Icon for the default empty state */
  emptyIcon?: ReactElement;
}

const { width } = Dimensions.get('window');

/**
 * StatefulList is a highly scalable, production-ready generic list component.
 * It standardizes how loading, empty, error, and pagination states are handled
 * across the entire application, enforcing a clean developer experience and consistent UX.
 */
export function StatefulList<T>({
  data,
  isLoading,
  isFetchingNextPage = false,
  error = null,
  onRetry,
  onRefresh,
  isRefreshing = false,
  LoadingComponent,
  EmptyComponent,
  emptyTitle = 'No Data Found',
  emptyMessage = 'There is nothing here yet.',
  emptyIcon,
  contentContainerStyle,
  ...flatListProps
}: StatefulListProps<T>) {
  const theme = useTheme();

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // 1. Error State
  if (error) {
    return (
      <Animated.View entering={FadeIn} style={styles.centerContainer}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.semantic.danger + '20' }]}>
          <AlertCircle color={theme.colors.semantic.danger} size={32} />
        </View>
        <Typography variant="h3" color={theme.colors.text.primary} style={styles.title}>
          Something went wrong
        </Typography>
        <Typography variant="body" color={theme.colors.text.secondary} style={styles.message}>
          {error.message || 'We could not load this content. Please try again.'}
        </Typography>
        {onRetry && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={onRetry}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retry loading content"
          >
            <RefreshCw color="#FFF" size={16} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }

  // 2. Loading State
  if (isLoading && (!data || data.length === 0)) {
    if (LoadingComponent) return LoadingComponent;
    
    return (
      <View style={styles.centerContainer} accessibilityRole="progressbar" accessibilityLabel="Loading content">
        <ActivityIndicator size="large" color={theme.colors.plum} />
        <Typography variant="caption" color={theme.colors.text.tertiary} style={{ marginTop: 12 }}>
          Loading...
        </Typography>
      </View>
    );
  }

  // 3. Empty State
  if (!data || data.length === 0) {
    if (EmptyComponent) {
      return (
        <ScrollView 
          contentContainerStyle={styles.scrollCenter}
          refreshControl={onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.plum} /> : undefined}
        >
          {EmptyComponent}
        </ScrollView>
      );
    }
    
    return (
      <ScrollView 
        contentContainerStyle={styles.scrollCenter}
        refreshControl={onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.plum} /> : undefined}
      >
        <Animated.View entering={FadeIn} style={styles.centerContainer}>
          <View style={styles.iconCircle}>
            {emptyIcon || <FileQuestion color={theme.colors.plum} size={32} />}
          </View>
          <Typography variant="h3" color={theme.colors.text.primary} style={styles.title}>
            {emptyTitle}
          </Typography>
          <Typography variant="body" color={theme.colors.text.secondary} style={styles.message}>
            {emptyMessage}
          </Typography>
        </Animated.View>
      </ScrollView>
    );
  }

  // 4. Data State (with pagination support)
  return (
    <FlatList
      data={data}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.plum}
            colors={[theme.colors.plum]} // Android
          />
        ) : undefined
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footerLoader} accessibilityRole="progressbar">
            <ActivityIndicator size="small" color={theme.colors.plum} />
          </View>
        ) : null
      }
      {...flatListProps}
    />
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: width,
  },
  scrollCenter: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.plum + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.plum,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  retryText: {
    color: '#FFF',
    fontFamily: theme.typography.fonts.body,
    fontWeight: '600',
    fontSize: 15,
  },
  footerLoader: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
