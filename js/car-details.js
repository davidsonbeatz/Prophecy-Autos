document.addEventListener('DOMContentLoaded', function() {
    // Get the car ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    
    // Define car data
    const carData = [
        {
            id: 1,
            make: 'Lexus',
            model: 'GX460',
            year: 2015,
            price: '₦27,000,000',
            condition: 'Neatly Used',
            description: 'Neatly Used Lexus GX460 2015 Model in excellent condition. This premium SUV offers exceptional comfort, reliability, and performance.',
            image: 'images/Car 1.jpg',
            features: ['Neatly Used', '2015 Model', 'Excellent Condition', 'Premium SUV']
        },
        {
            id: 2,
            make: 'Lexus',
            model: 'ES350',
            year: 2010,
            price: '₦13,800,000',
            condition: 'Direct TOKs',
            description: 'Direct TOKs Lexus ES350 2010 Model with Full Options. This luxury sedan offers exceptional comfort and reliability.',
            image: 'images/Car 2.jpg',
            features: ['Direct TOKs', '2010 Model', 'Full Options', 'Luxury Sedan']
        },
        {
            id: 3,
            make: 'Lexus',
            model: 'IS250',
            year: 2010,
            price: '₦9,800,000',
            condition: 'Used',
            description: 'Lexus IS250 in excellent condition. This compact luxury sedan offers a perfect balance of performance and comfort.',
            image: 'images/Car 3.jpg',
            features: ['2010 Model', 'Excellent Condition', 'Compact Luxury Sedan']
        },
        {
            id: 4,
            make: 'Mercedes',
            model: 'ML 350',
            year: 2013,
            price: '₦17,500,000',
            condition: 'TOKs Standard',
            description: 'TOKs Standard Mercedes Benz ML 350 2013 Model. This luxury SUV offers exceptional comfort, reliability, and performance.',
            image: 'images/Car 4.jpg',
            features: ['TOKs Standard', '2013 Model', 'Luxury SUV']
        },
        {
            id: 5,
            make: 'Mercedes',
            model: 'GLE',
            year: 2016,
            price: '₦30,000,000',
            condition: 'Less than a year used',
            description: 'Less than a year used Mercedes GLE 2016 Model with Full Option. This premium SUV offers exceptional comfort, reliability, and performance.',
            image: 'images/Car 5.jpg',
            features: ['Less than a year used', '2016 Model', 'Full Option', 'Premium SUV']
        },
        {
            id: 6,
            make: 'Lexus',
            model: 'RX350',
            year: 2014,
            price: '₦24,600,000',
            condition: 'Direct TOKs',
            description: 'Direct TOKs Lexus RX350 2014 Model, Accident Free and Full Option. This luxury crossover offers exceptional comfort, reliability, and performance.',
            image: 'images/Car 6.jpg',
            features: ['Direct TOKs', '2014 Model', 'Accident Free', 'Full Option', 'Luxury Crossover']
        },
        {
            id: 7,
            make: 'Mercedes',
            model: 'C300',
            year: 2015,
            price: '₦13,500,000',
            condition: 'Neatly Registered',
            description: 'Neatly Registered Mercedes Benz C300 2015 Model with Thumb start, 2022 Entry. This luxury sedan offers exceptional comfort, reliability, and performance.',
            image: 'images/Car 7.jpg',
            features: ['Neatly Registered', '2015 Model', 'Thumb start', '2022 Entry', 'Luxury Sedan']
        }
    ];
    
    // Find the car by ID
    const car = carData.find(car => car.id === parseInt(carId)) || carData[0];
    
    // Update the page with car details
    updateCarDetails(car);
    
    // Update similar cars section
    updateSimilarCars(car, carData);
});

function updateCarDetails(car) {
    // Update car title and price
    document.getElementById('car-title').textContent = `${car.make} ${car.model} ${car.year} Model`;
    document.getElementById('car-price').textContent = car.price;
    
    // Update car tag
    document.getElementById('car-condition-tag').textContent = car.condition;
    
    // Update main image
    document.getElementById('main-car-image').src = car.image;
    document.getElementById('main-car-image').alt = `${car.make} ${car.model} ${car.year}`;
    
    // Update thumbnails
    const thumbnailsContainer = document.querySelector('.thumbnails');
    thumbnailsContainer.innerHTML = `
        <div class="car-thumbnail active">
            <img src="${car.image}" alt="${car.make} ${car.model} Front">
        </div>
    `;
    
    // Update car meta information
    document.getElementById('car-year').textContent = car.year;
    document.getElementById('car-condition').textContent = car.condition;
    document.getElementById('car-make').textContent = car.make;
    document.getElementById('car-model').textContent = car.model;
    
    // Update car description
    document.getElementById('car-description-text').textContent = car.description;
    
    // Update features list
    const featuresListContainer = document.getElementById('features-list');
    featuresListContainer.innerHTML = '';
    
    car.features.forEach(feature => {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        featureItem.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${feature}</span>
        `;
        featuresListContainer.appendChild(featureItem);
    });
}

function updateSimilarCars(currentCar, allCars) {
    // Get similar cars (same make or same model type)
    const similarCars = allCars
        .filter(car => car.id !== currentCar.id && (car.make === currentCar.make || isSimilarModelType(car.model, currentCar.model)))
        .slice(0, 3); // Get up to 3 similar cars
    
    const similarCarsContainer = document.querySelector('.similar-cars-grid');
    if (!similarCarsContainer) return;
    
    similarCarsContainer.innerHTML = '';
    
    similarCars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <div class="car-image">
                <img src="${car.image}" alt="${car.make} ${car.model}">
                <div class="car-tag">${car.condition}</div>
            </div>
            <div class="car-details">
                <h3>${car.make} ${car.model}</h3>
                <div class="car-info">
                    <span><i class="fas fa-calendar"></i> ${car.year}</span>
                </div>
                <div class="car-price">
                    <span>${car.price}</span>
                </div>
                <a href="car-details.html?id=${car.id}" class="btn btn-outline">View Details</a>
            </div>
        `;
        similarCarsContainer.appendChild(carCard);
    });
}

function isSimilarModelType(model1, model2) {
    // Check if models are similar (e.g., both are SUVs, sedans, etc.)
    const suvModels = ['GX460', 'ML 350', 'GLE', 'RX350'];
    const sedanModels = ['ES350', 'IS250', 'C300'];
    
    return (suvModels.includes(model1) && suvModels.includes(model2)) ||
           (sedanModels.includes(model1) && sedanModels.includes(model2));
}