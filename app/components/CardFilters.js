import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

export default function CardFilters({ 
  searchQuery, 
  onSearchChange, 
  activeFilter, 
  onFilterChange 
}) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher une carte..."
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      
      <View style={styles.filters}>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.activeFilter
          ]}
          onPress={() => onFilterChange('all')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'all' && styles.activeFilterText
          ]}>
            Toutes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            activeFilter === 'owned' && styles.activeFilter
          ]}
          onPress={() => onFilterChange('owned')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'owned' && styles.activeFilterText
          ]}>
            Possédées
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            activeFilter === 'wishlist' && styles.activeFilter
          ]}
          onPress={() => onFilterChange('wishlist')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'wishlist' && styles.activeFilterText
          ]}>
            Wishlist
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    textAlign: 'center',
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
