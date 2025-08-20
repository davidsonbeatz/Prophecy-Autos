document.addEventListener('DOMContentLoaded', function() {
    // Get filter elements
    const makeFilter = document.getElementById('make-filter');
    const modelFilter = document.getElementById('model-filter');
    const yearFilter = document.getElementById('year-filter');
    const conditionFilter = document.getElementById('condition-filter');
    const priceRange = document.getElementById('price-range');
    const priceRangeValue = document.getElementById('price-range-value');
    const filterButton = document.getElementById('apply-filters');
    const resetButton = document.getElementById('reset-filters');
    const resultsCount = document.getElementById('results-count');
    
    // Get all car items
    const carItems = document.querySelectorAll('.car-item');
    
    // Initialize results count
    updateResultsCount();
    
    // Update price range value display
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            const value = this.value;
            const price = (value / 100) * 30000000; // Max price is ₦30,000,000
            priceRangeValue.textContent = '₦' + formatPrice(price);
        });
    }
    
    // Apply filters when button is clicked
    if (filterButton) {
        filterButton.addEventListener('click', applyFilters);
    }
    
    // Reset filters when button is clicked
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
    
    // Apply filters function
    function applyFilters() {
        const selectedMake = makeFilter.value;
        const selectedModel = modelFilter.value;
        const selectedYear = yearFilter.value;
        const selectedCondition = conditionFilter.value;
        const selectedPrice = (priceRange.value / 100) * 30000000; // Max price is ₦30,000,000
        
        carItems.forEach(function(car) {
            const carMake = car.getAttribute('data-make');
            const carModel = car.getAttribute('data-model');
            const carYear = car.getAttribute('data-year');
            const carCondition = car.getAttribute('data-condition');
            const carPrice = parseInt(car.getAttribute('data-price'));
            
            // Check if car matches all selected filters
            const matchesMake = selectedMake === 'all' || carMake === selectedMake;
            const matchesModel = selectedModel === 'all' || carModel === selectedModel;
            const matchesYear = selectedYear === 'all' || carYear === selectedYear;
            const matchesCondition = selectedCondition === 'all' || carCondition === selectedCondition;
            const matchesPrice = carPrice <= selectedPrice;
            
            // Show or hide car based on filter matches
            if (matchesMake && matchesModel && matchesYear && matchesCondition && matchesPrice) {
                car.style.display = 'block';
            } else {
                car.style.display = 'none';
            }
        });
        
        // Update results count
        updateResultsCount();
    }
    
    // Reset filters function
    function resetFilters() {
        makeFilter.value = 'all';
        modelFilter.value = 'all';
        yearFilter.value = 'all';
        conditionFilter.value = 'all';
        priceRange.value = 100;
        priceRangeValue.textContent = '₦30,000,000';
        
        // Show all cars
        carItems.forEach(function(car) {
            car.style.display = 'block';
        });
        
        // Update results count
        updateResultsCount();
    }
    
    // Update results count function
    function updateResultsCount() {
        const visibleCars = document.querySelectorAll('.car-item[style="display: block"]').length || carItems.length;
        resultsCount.textContent = visibleCars;
    }
    
    // Format price with commas
    function formatPrice(price) {
        return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
});