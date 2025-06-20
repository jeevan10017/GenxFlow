import React, { useState } from 'react';
import { Search, MapPin, Package, Truck, BarChart3, Users, Leaf, DollarSign, Clock, Star, Upload, Eye, CheckCircle, AlertCircle, RefreshCw, ThumbsUp, ThumbsDown, ArrowRight, Circle, ChevronRight,Route,AlertTriangle } from 'lucide-react';

const PackLoopDemo = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [userRole, setUserRole] = useState(null);
  const [demoStep, setDemoStep] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [packagingStatus, setPackagingStatus] = useState('new');
  const [packagingQuality, setPackagingQuality] = useState(8.5);
  const [packagingPrice, setPackagingPrice] = useState(150);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Sample data for demo
  const sampleListings = [
    {
      id: 1,
      title: "Plastic Crates - Tech Manufacturing",
      company: "TechCorp Solutions",
      location: "Mumbai, Maharashtra",
      quantity: 500,
      unitPrice: 150,
      condition: "Good",
      qualityScore: 8.5,
      distance: 150,
      images: ["🗃️", "📦", "🎁"],
      carbonSaved: 2.4,
      savings: 39000,
      lifecycle: 1
    },
    {
      id: 2,
      title: "Wooden Pallets - Food Processing",
      company: "FreshFoods Ltd",
      location: "Pune, Maharashtra",
      quantity: 200,
      unitPrice: 85,
      condition: "Excellent",
      qualityScore: 9.2,
      distance: 80,
      images: ["🪵", "📦", "🎁"],
      carbonSaved: 1.8,
      savings: 15000,
      lifecycle: 2
    },
    {
      id: 3,
      title: "Repackaged Plastic Crates - EcoMart",
      company: "EcoMart",
      location: "Pune, Maharashtra",
      quantity: 300,
      unitPrice: 70,
      condition: "Fair",
      qualityScore: 5.5,
      distance: 0,
      images: ["🔄", "🗃️", "📦"],
      carbonSaved: 1.8,
      savings: 24000,
      lifecycle: 2,
      previousOwner: "TechCorp Solutions"
    }
  ];

  const analytics = {
    totalTransactions: 1247,
    itemsCirculated: 45632,
    carbonSaved: 289.5,
    costSavings: 2845000,
    activeUsers: 892,
    avgSatisfaction: 4.6
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Function to handle packaging rating
  const ratePackaging = (rating) => {
    const newQuality = rating;
    const newPrice = Math.max(40, Math.round((newQuality / 10) * 100)); // Minimum ₹40
    
    setPackagingQuality(newQuality);
    setPackagingPrice(newPrice);
    setPackagingStatus('returned');
    setRatingSubmitted(true);
    
    addNotification(`Packaging rated ${newQuality}/10! Relisted at ₹${newPrice} per unit`, 'success');
    setDemoStep(5);
  };

  // Function to start a new packaging lifecycle
  const relistPackaging = () => {
    setPackagingStatus('new');
    setPackagingQuality(8.5);
    setPackagingPrice(150);
    setRatingSubmitted(false);
    addNotification('Packaging relisted for new lifecycle!', 'success');
    setCurrentView('supplierDashboard');
  };

  // Landing Page
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">PackLoop</span>
          </div>
          <button 
            onClick={() => setCurrentView('roleSelection')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Packaging Waste into <span className="text-green-600">Profit</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect suppliers, buyers, and transporters in a circular packaging marketplace. 
            Save costs, reduce carbon footprint, and build sustainable supply chains.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => setCurrentView('roleSelection')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition-colors"
            >
              Start Demo
            </button>
            <button 
              onClick={() => setCurrentView('analytics')}
              className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg text-lg hover:bg-green-50 transition-colors"
            >
              View Impact
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Inventory</h3>
            <p className="text-gray-600">AI-powered quality assessment and bulk listing management</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Route Optimization</h3>
            <p className="text-gray-600">Reduce empty miles with intelligent logistics matching</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <RefreshCw className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Circular Economy</h3>
            <p className="text-gray-600">Extend packaging lifecycle with quality-based repricing</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">The Circular Packaging Journey</h2>
          <div className="flex justify-center mb-8">
            <div className="flex items-center max-w-4xl overflow-x-auto py-4 px-2">
              {[
                { step: 1, title: "Supplier Lists", desc: "New packaging at ₹150", icon: Package },
                { step: 2, title: "Buyer 1 Purchases", desc: "Uses for product shipment", icon: Truck },
                { step: 3, title: "Quality Rating", desc: "After use, rates packaging", icon: Star },
                { step: 4, title: "Repricing", desc: "Relisted at new price (e.g. ₹70)", icon: DollarSign },
                { step: 5, title: "Buyer 2 Purchases", desc: "Gets packaging at lower cost", icon: Users },
              ].map((step, index) => (
                <React.Fragment key={step.step}>
                  <div className="flex flex-col items-center w-40 mx-4">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                      <step.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">Step {step.step}</p>
                      <p className="text-sm font-medium text-gray-700">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                  {index < 4 && (
                    <div className="flex items-center justify-center text-gray-300">
                      <ChevronRight className="h-8 w-8" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.totalTransactions.toLocaleString()}</div>
              <div className="text-gray-600">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.carbonSaved}T</div>
              <div className="text-gray-600">CO₂ Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">₹{(analytics.costSavings/100000).toFixed(1)}L</div>
              <div className="text-gray-600">Cost Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">2.3x</div>
              <div className="text-gray-600">Avg. Lifecycles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Role Selection
  const RoleSelection = () => (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
          <p className="text-xl text-gray-600">Select your role to explore the PackLoop experience</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { role: 'supplier', icon: Package, title: 'Supplier', desc: 'List and sell surplus packaging', color: 'green' },
            { role: 'buyer', icon: Search, title: 'Buyer', desc: 'Find and purchase packaging', color: 'blue' },
            { role: 'transporter', icon: Truck, title: 'Transporter', desc: 'Provide logistics services', color: 'purple' },
            { role: 'admin', icon: BarChart3, title: 'Admin', desc: 'Monitor platform analytics', color: 'orange' }
          ].map(({ role, icon: Icon, title, desc, color }) => (
            <button
              key={role}
              onClick={() => {
                setUserRole(role);
                setCurrentView(`${role}Dashboard`);
                addNotification(`Welcome to ${title} dashboard!`, 'success');
              }}
              className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-${color}-200`}
            >
              <Icon className={`h-16 w-16 text-${color}-600 mx-auto mb-4`} />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={() => setCurrentView('landing')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Supplier Dashboard
  const SupplierDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Supplier</span>
          </div>
          <button onClick={() => setCurrentView('roleSelection')} className="text-gray-600 hover:text-gray-800">
            Switch Role
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, TechCorp Solutions!</h1>
          <p className="text-gray-600">Manage your packaging inventory and track lifecycle</p>
          
          {/* Packaging Lifecycle Status */}
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Current Packaging Lifecycle</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    packagingStatus === 'new' ? 'bg-green-100 text-green-800' : 
                    packagingStatus === 'in-use' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {packagingStatus === 'new' ? 'New Inventory' : 
                     packagingStatus === 'in-use' ? 'In Use' : 'Ready for Relisting'}
                  </span>
                  
                  {packagingStatus === 'returned' && (
                    <button 
                      onClick={relistPackaging}
                      className="bg-purple-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-purple-700"
                    >
                      Relist Packaging
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Listings', value: '12', icon: Package, color: 'blue' },
            { label: 'Pending Orders', value: '3', icon: Clock, color: 'orange' },
            { label: 'Total Revenue', value: '₹1.24L', icon: DollarSign, color: 'green' },
            { label: 'Sustainability Score', value: '8.7/10', icon: Leaf, color: 'emerald' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <Icon className={`h-8 w-8 text-${color}-600`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  addNotification('CSV template downloaded!', 'success');
                  setDemoStep(1);
                }}
                className="w-full flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium">Bulk Upload Inventory</p>
                  <p className="text-sm text-gray-600">Upload CSV with your packaging items</p>
                </div>
              </button>
              
              <button 
                onClick={() => addNotification('Single listing form opened', 'info')}
                className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Create Single Listing</p>
                  <p className="text-sm text-gray-600">Add individual packaging items</p>
                </div>
              </button>

              <button 
                onClick={() => setCurrentView('qualityDemo')}
                className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-6 w-6 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">AI Quality Assessment</p>
                  <p className="text-sm text-gray-600">See how AI grades your items</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { type: 'order', message: 'New order received for Plastic Crates', time: '2 hours ago', status: 'success' },
                { type: 'quality', message: 'Quality assessment completed for Wooden Pallets', time: '5 hours ago', status: 'info' },
                { type: 'listing', message: '500 Metal Containers listed successfully', time: '1 day ago', status: 'success' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {demoStep === 1 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Demo: Bulk Upload Process</h3>
            </div>
            <p className="text-green-800 mb-4">
              In a real scenario, you would now upload a CSV file with your inventory. 
              Our AI would process images and assign quality scores automatically.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium mb-2">Sample CSV Data:</h4>
                <pre className="text-xs text-gray-600">
{`Item,Quantity,Price,Location
Plastic Crates,500,150,Mumbai
Wooden Pallets,200,85,Pune
Metal Containers,100,200,Delhi`}
                </pre>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium mb-2">AI Processing Results:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Quality Score:</span>
                    <span className="font-medium text-green-600">8.5/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span className="font-medium">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Price:</span>
                    <span className="font-medium">₹140-160</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Buyer Dashboard
  const BuyerDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Buyer</span>
          </div>
          <button onClick={() => setCurrentView('roleSelection')} className="text-gray-600 hover:text-gray-800">
            Switch Role
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Perfect Packaging, EcoMart!</h1>
          <p className="text-gray-600">Search sustainable packaging solutions near you</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Search className="h-6 w-6 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for packaging type, location, or company..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={() => setDemoStep(2)}
            />
            <button 
              onClick={() => {
                setDemoStep(3);
                addNotification('Found 3 matching listings!', 'success');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Plastic Crates', 'Wooden Pallets', 'Metal Containers', 'Within 200km', 'Good Condition'].map((filter) => (
              <span key={filter} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {filter}
              </span>
            ))}
          </div>
        </div>

        {demoStep >= 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Search Results (3 found)</h2>
            
            {sampleListings.map((listing) => (
              <div 
                key={listing.id} 
                className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                  listing.lifecycle === 1 ? 'border-green-500' : 
                  listing.lifecycle === 2 ? 'border-purple-500' : 
                  'border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {listing.title}
                      {listing.lifecycle > 1 && (
                        <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          Cycle #{listing.lifecycle}
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {listing.company} • {listing.location} • {listing.distance}km away
                      {listing.previousOwner && (
                        <span className="ml-2 text-sm text-gray-500">
                          (Previously from {listing.previousOwner})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{listing.unitPrice}</p>
                    <p className="text-sm text-gray-500">per unit</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{listing.quantity} units available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">Quality: {listing.qualityScore}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">{listing.carbonSaved}T CO₂ saved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Save ₹{listing.savings.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {listing.images.map((img, idx) => (
                      <div key={idx} className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {img}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setCurrentView('orderDemo')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Request Quote
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {demoStep < 3 && (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">Start Your Search</h3>
            <p className="text-gray-400">Enter your packaging requirements above to find available options</p>
          </div>
        )}
      </div>
    </div>
  );

  // Transporter Dashboard
  const TransporterDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Truck className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Transporter</span>
          </div>
          <button onClick={() => setCurrentView('roleSelection')} className="text-gray-600 hover:text-gray-800">
            Switch Role
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, GreenLogistics!</h1>
          <p className="text-gray-600">Optimize your routes and reduce empty miles</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Available Jobs', value: '7', icon: Package, color: 'blue' },
            { label: 'Active Routes', value: '2', icon: Truck, color: 'purple' },
            { label: 'Monthly Earnings', value: '₹45,200', icon: DollarSign, color: 'green' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <Icon className={`h-8 w-8 text-${color}-600`} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Optimal Job Match</h2>
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-900">Mumbai → Pune Route</h3>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">Perfect Match</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Pickup:</strong> TechCorp, Mumbai</p>
                <p><strong>Delivery:</strong> EcoMart, Pune</p>
                <p><strong>Load:</strong> 300 plastic crates (~2.5T)</p>
              </div>
              <div>
                <p><strong>Distance:</strong> 150 km</p>
                <p><strong>Payment:</strong> ₹4,500</p>
                <p><strong>Empty Miles Saved:</strong> 300 km</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2 text-green-700">
                <Leaf className="h-4 w-4" />
                <span className="text-sm">Carbon saved: 45 kg CO₂</span>
              </div>
              <button 
                onClick={() => {
                  setCurrentView('routeDemo');
                  addNotification('Job accepted! Route optimization in progress...', 'success');
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Accept Job
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Other Available Jobs</h2>
            <div className="space-y-3">
              {[
                { from: 'Mumbai', to: 'Mysore', distance: '140 km', payment: '₹7,200', load: '230 pallets' },
                { from: 'Mumbai', to: 'Warangal', distance: '150 km', payment: '₹6,000', load: '150 crates' },
                { from: 'Mumbai', to: 'Coimbatore', distance: '350 km', payment: '₹15,000', load: '280 crates + 50 pallets' },
              ].map((job, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{job.from} → {job.to}</p>
                      <p className="text-sm text-gray-600">{job.load} • {job.distance}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{job.payment}</p>
                      <button className="text-sm text-blue-600 hover:underline">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold">98.5%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Customer Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">4.8</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Empty Miles Reduced</span>
                <span className="font-semibold text-green-600">2,450 km</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">CO₂ Saved</span>
                <span className="font-semibold text-green-600">1.2 tons</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Admin Dashboard
  const AdminDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Admin</span>
          </div>
          <button onClick={() => setCurrentView('roleSelection')} className="text-gray-600 hover:text-gray-800">
            Switch Role
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
          <p className="text-gray-600">Monitor PackLoop's impact and performance</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Transactions', value: analytics.totalTransactions.toLocaleString(), icon: Package, color: 'blue', change: '+12.5%' },
            { label: 'Items Circulated', value: analytics.itemsCirculated.toLocaleString(), icon: Users, color: 'green', change: '+8.2%' },
            { label: 'CO₂ Saved (Tons)', value: analytics.carbonSaved, icon: Leaf, color: 'emerald', change: '+15.3%' },
            { label: 'Cost Savings (₹)', value: `₹${(analytics.costSavings/100000).toFixed(1)}L`, icon: DollarSign, color: 'purple', change: '+22.1%' }
          ].map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-8 w-8 text-${color}-600`} />
                <span className="text-green-600 text-sm font-medium">{change}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {[
                { company: 'TechCorp → EcoMart', amount: '₹45,000', items: '300 Plastic Crates', status: 'Completed', time: '2 hours ago' },
                { company: 'FreshFoods → QuickMart', amount: '₹17,000', items: '200 Wooden Pallets', status: 'In Transit', time: '5 hours ago' },
                { company: 'MetalWorks → BuildCorp', amount: '₹20,000', items: '100 Metal Containers', status: 'Processing', time: '1 day ago' }
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.company}</p>
                    <p className="text-sm text-gray-600">{transaction.items}</p>
                    <p className="text-xs text-gray-500">{transaction.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{transaction.amount}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">System Status</span>
                </div>
                <span className="text-green-600 font-semibold">All Systems Operational</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics.activeUsers}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgSatisfaction}</p>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Server Load</span>
                  <span>23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '23%'}}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Response Time</span>
                  <span>145ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Environmental Impact Summary</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <Leaf className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-600">{analytics.carbonSaved}T</p>
              <p className="text-gray-600">Total CO₂ Saved</p>
              <p className="text-sm text-gray-500 mt-1">Equivalent to planting 1,247 trees</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Truck className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-blue-600">{analytics.itemsCirculated.toLocaleString()}</p>
              <p className="text-gray-600">Items Circulated</p>
              <p className="text-sm text-gray-500 mt-1">Over 10,000 tons of packaging reused</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-purple-600">₹{(analytics.costSavings/100000).toFixed(1)}L</p>
              <p className="text-gray-600">Total Cost Savings</p>
              <p className="text-sm text-gray-500 mt-1">Helping businesses save on logistics costs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Quality Demo
  const QualityDemo = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Eye className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">AI Quality Assessment</span>
          </div>
          <button onClick={() => setCurrentView('supplierDashboard')} className="text-gray-600 hover:text-gray-800">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Quality Assessment</h1>
          <p className="text-gray-600">See how our computer vision technology analyzes packaging condition</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['🗃️', '📦', '🎁', '🪵', '📐', '🧪'].map((img, idx) => (
                  <div key={idx} className="bg-gray-100 rounded-lg h-24 flex items-center justify-center text-3xl">
                    {img}
                  </div>
                ))}
              </div>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">
                Upload More Images
              </button>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Quality Analysis</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Structural Integrity</span>
                    <span className="font-medium">9.2/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Surface Cleanliness</span>
                    <span className="font-medium">7.8/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Wear & Tear</span>
                    <span className="font-medium">8.5/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Overall Quality Score</span>
                    <span className="text-2xl font-bold text-green-600">8.5/10</span>
                  </div>
                  <div className="mt-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Good Condition</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Market Recommendations</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Optimal Price Range</h3>
              <p className="text-2xl font-bold text-green-600">₹140-160</p>
              <p className="text-sm text-green-700">Based on similar items in your region</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Potential Savings</h3>
              <p className="text-2xl font-bold text-blue-600">₹39,000</p>
              <p className="text-sm text-blue-700">Compared to new packaging</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Carbon Impact</h3>
              <p className="text-2xl font-bold text-purple-600">2.4T CO₂</p>
              <p className="text-sm text-purple-700">Potential savings vs new</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => {
                setCurrentView('supplierDashboard');
                addNotification('Quality assessment completed! Listing created.', 'success');
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Create Listing with AI Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Order Demo
  const OrderDemo = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Order Processing</span>
          </div>
          <button onClick={() => setCurrentView('buyerDashboard')} className="text-gray-600 hover:text-gray-800">
            Back to Search
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
          <p className="text-gray-600">Request packaging from TechCorp Solutions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start mb-6">
            <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center text-2xl mr-4">
              🗃️
            </div>
            <div>
              <h2 className="text-xl font-semibold">Plastic Crates - Tech Manufacturing</h2>
              <p className="text-gray-600">TechCorp Solutions • Mumbai, Maharashtra</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold text-green-600">₹150</p>
              <p className="text-sm text-gray-600">per unit</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Order Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantity Needed</label>
                  <input 
                    type="number" 
                    defaultValue="300"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Delivery Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Special Requirements</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Any specific inspection needs or handling instructions"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Transportation Options</h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:bg-green-50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium">GreenLogistics Express</p>
                      <p className="text-sm text-gray-600">Estimated delivery: 2 days</p>
                    </div>
                    <p className="font-bold text-green-600">₹4,500</p>
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <Leaf className="h-4 w-4 mr-1" />
                    <span>45 kg CO₂ saved • 300 km empty miles avoided</span>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium">Standard Transport</p>
                      <p className="text-sm text-gray-600">Estimated delivery: 3 days</p>
                    </div>
                    <p className="font-bold">₹7,200</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Economy Transport</p>
                      <p className="text-sm text-gray-600">Estimated delivery: 5 days</p>
                    </div>
                    <p className="font-bold">₹6,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">300 units @ ₹150 each</span>
              <span className="font-medium">₹45,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transportation</span>
              <span className="font-medium">₹4,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium">₹1,500</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹55,000</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-green-600">
              <Leaf className="h-5 w-5" />
              <span className="font-medium">Estimated carbon savings: 2.4T CO₂</span>
            </div>
            
            <button 
              onClick={() => {
                setCurrentView('routeDemo');
                setPackagingStatus('in-use');
                setActiveTransaction({
                  id: Date.now(),
                  packagingId: 1,
                  quantity: 300,
                  buyer: "EcoMart",
                  supplier: "TechCorp Solutions",
                  price: 150
                });
                addNotification('Order placed successfully! Transport assigned.', 'success');
              }}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const RouteDemo = ({ setCurrentView, addNotification }) => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Truck className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Route Optimization</span>
          </div>
          <button onClick={() => setCurrentView('transporterDashboard')} className="text-gray-600 hover:text-gray-800">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mumbai → Pune Delivery Route</h1>
          <p className="text-gray-600">AI-optimized routing with real-time traffic analysis</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 h-[500px] relative overflow-hidden">
              {/* Enhanced map visualization */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl">
                
                {/* Mumbai (Origin) */}
                <div className="absolute top-[20%] left-[15%] flex flex-col items-center">
                  <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg shadow-md mt-2 text-center">
                    <p className="font-semibold text-sm">Mumbai</p>
                    <p className="text-xs text-gray-600">Origin</p>
                  </div>
                </div>

                {/* Pune (Optimal Destination) */}
                <div className="absolute bottom-[20%] right-[20%] flex flex-col items-center">
                  <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg shadow-md mt-2 text-center">
                    <p className="font-semibold text-sm">Pune</p>
                    <p className="text-xs text-green-600">✓ Optimal</p>
                  </div>
                </div>

                {/* Non-optimized destinations */}
                {/* Mysore */}
                <div className="absolute bottom-[30%] left-[25%] flex flex-col items-center">
                  <div className="bg-red-500 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div className="bg-white px-2 py-1 rounded-lg shadow-md mt-1 text-center border-2 border-red-200">
                    <p className="font-semibold text-xs">Mysore</p>
                    <p className="text-xs text-red-600">140km</p>
                  </div>
                </div>

                {/* Warangal */}
                <div className="absolute top-[35%] right-[15%] flex flex-col items-center">
                  <div className="bg-red-500 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div className="bg-white px-2 py-1 rounded-lg shadow-md mt-1 text-center border-2 border-red-200">
                    <p className="font-semibold text-xs">Warangal</p>
                    <p className="text-xs text-red-600">150km</p>
                  </div>
                </div>

                {/* Coimbatore */}
                <div className="absolute bottom-[10%] left-[40%] flex flex-col items-center">
                  <div className="bg-red-500 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <div className="bg-white px-2 py-1 rounded-lg shadow-md mt-1 text-center border-2 border-red-200">
                    <p className="font-semibold text-xs">Coimbatore</p>
                    <p className="text-xs text-red-600">350km</p>
                  </div>
                </div>
                
                {/* Optimal route path (Mumbai to Pune) */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="optimizedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 100 100 Q 200 150 320 340" 
                    stroke="url(#optimizedGradient)" 
                    strokeWidth="4" 
                    fill="none"
                    strokeDasharray="0"
                    className="drop-shadow-sm"
                  />
                  {/* Route animation dots */}
                  <circle r="4" fill="#10b981" className="animate-pulse">
                    <animateMotion dur="3s" repeatCount="indefinite">
                      <mpath href="#optimizedPath"/>
                    </animateMotion>
                  </circle>
                </svg>

                {/* Non-optimized route paths */}
                <svg className="absolute inset-0 w-full h-full">
                  {/* Mumbai to Mysore */}
                  <path 
                    d="M 100 100 Q 150 200 180 280" 
                    stroke="#ef4444" 
                    strokeWidth="2" 
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                  {/* Mumbai to Warangal */}
                  <path 
                    d="M 100 100 Q 250 120 350 180" 
                    stroke="#ef4444" 
                    strokeWidth="2" 
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                  {/* Mumbai to Coimbatore */}
                  <path 
                    d="M 100 100 Q 200 250 280 400" 
                    stroke="#ef4444" 
                    strokeWidth="2" 
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                </svg>
                
                {/* Route info overlay */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Route className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold">Optimal Route Selected</span>
                  </div>
                  <p className="text-xs text-gray-600">AI analyzed 247 possible routes</p>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-1 bg-green-500 rounded"></div>
                      <span className="text-xs">Optimized Route</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-1 bg-red-500 rounded" style={{background: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)'}}></div>
                      <span className="text-xs">Non-optimized Alternatives</span>
                    </div>
                  </div>
                </div>

                {/* Traffic indicators */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Light Traffic</span>
                  </div>
                </div>
              </div>
            </div>

           
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Route Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                  <p className="font-medium">TechCorp Solutions, Mumbai</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Location</p>
                  <p className="font-medium">EcoMart Distribution Center, Pune</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cargo Details</p>
                  <p className="font-medium">300 Plastic Crates (2.5 tons)</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">Distance</p>
                    <p className="text-xl font-bold">150 km</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">Estimated Time</p>
                    <p className="text-xl font-bold">3 hours</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700 mb-1">Payment</p>
                    <p className="text-xl font-bold">₹4,500</p>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <p className="text-sm text-emerald-700 mb-1">CO₂ Savings</p>
                    <p className="text-xl font-bold">45 kg</p>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Route Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Truck className="h-5 w-5" />
                  <span>Start Route Navigation</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Package className="h-5 w-5" />
                  <span>Scan Inventory at Pickup</span>
                </button>
                
                <button 
                  onClick={() => {
                    setCurrentView('ratingView');
                    addNotification('Delivery completed! Please rate the packaging.', 'info');
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Mark as Delivered</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Rating View
  const RatingView = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Star className="h-8 w-8 text-yellow-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Packaging Rating</span>
          </div>
          <button onClick={() => setCurrentView('buyerDashboard')} className="text-gray-600 hover:text-gray-800">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Your Packaging</h1>
          <p className="text-gray-600">Help us maintain quality in the circular packaging ecosystem</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center text-2xl mr-4">
              🗃️
            </div>
            <div>
              <h2 className="text-xl font-semibold">Plastic Crates from TechCorp</h2>
              <p className="text-gray-600">Used in your recent shipment</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-center">How would you rate the condition after use?</h3>
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setPackagingQuality(num)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    packagingQuality === num 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-lg font-medium">
                Current Rating: <span className="text-green-600">{packagingQuality}</span>/10
              </p>
              <p className="text-gray-600 mt-1">
                {packagingQuality >= 9 ? 'Excellent - Like new condition' :
                 packagingQuality >= 7 ? 'Good - Minor wear and tear' :
                 packagingQuality >= 5 ? 'Fair - Some damage but usable' :
                 'Poor - Significant damage'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Circular Economy Impact</h4>
                <p className="text-blue-700">
                  Based on your rating, this packaging will be relisted at approximately 
                  ₹<span className="font-bold">{Math.max(40, Math.round((packagingQuality / 10) * 100))}</span> per unit,
                  ready for its next lifecycle in the circular economy.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                ratePackaging(packagingQuality);
                setCurrentView('circularFlow');
              }}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
            >
              Submit Rating & Relist Packaging
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Circular Flow View
  const CircularFlowView = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <RefreshCw className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Circular Flow Completed</span>
          </div>
          <button onClick={() => setCurrentView('landing')} className="text-gray-600 hover:text-gray-800">
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="mb-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Packaging Lifecycle Completed!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You've successfully participated in the circular packaging economy. 
            Your packaging has been given a new life at a new price point.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full">
            <h2 className="text-2xl font-bold mb-6">Packaging Lifecycle Journey</h2>
            <div className="flex justify-between items-center mb-8">
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <p className="font-bold">Supplier Lists</p>
                <p className="text-sm">₹150 per unit</p>
                <p className="text-xs text-gray-500">Quality: 8.5/10</p>
              </div>
              
              <ArrowRight className="h-8 w-8 text-gray-300" />
              
              <div className="text-center">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <p className="font-bold">Buyer 1 Uses</p>
                <p className="text-sm">EcoMart shipment</p>
                <p className="text-xs text-gray-500">300 units</p>
              </div>
              
              <ArrowRight className="h-8 w-8 text-gray-300" />
              
              <div className="text-center">
                <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="font-bold">Rated After Use</p>
                <p className="text-sm">{packagingQuality}/10</p>
                <p className="text-xs text-gray-500">Condition assessment</p>
              </div>
              
              <ArrowRight className="h-8 w-8 text-gray-300" />
              
              <div className="text-center">
                <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <RefreshCw className="h-8 w-8 text-purple-600" />
                </div>
                <p className="font-bold">Relisted</p>
                <p className="text-sm">₹{packagingPrice} per unit</p>
                <p className="text-xs text-gray-500">New lifecycle begins</p>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <Leaf className="h-5 w-5" />
                <p className="font-medium">
                  This circular flow saved an additional 0.6T CO₂ and extended the packaging's usable life
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Cost Savings</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Buyer 1 Savings</span>
                <span className="font-bold text-green-600">₹39,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Buyer 2 Savings</span>
                <span className="font-bold text-green-600">₹24,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Supplier Revenue</span>
                <span className="font-bold text-blue-600">₹45,000 + ₹21,000</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Environmental Impact</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">CO₂ Saved</span>
                <span className="font-bold text-green-600">3.0T</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Resource Efficiency</span>
                <span className="font-bold text-green-600">48%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Packaging Lifecycles</span>
                <span className="font-bold text-purple-600">2</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => setCurrentView('buyerDashboard')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
          >
            View Relisted Packaging
          </button>
          <button 
            onClick={() => setCurrentView('analytics')}
            className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50"
          >
            View Full Impact
          </button>
        </div>
      </div>
    </div>
  );

  // Analytics Page
  const AnalyticsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold">PackLoop</span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Impact Analytics</span>
          </div>
          <button onClick={() => setCurrentView('landing')} className="text-gray-600 hover:text-gray-800">
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Impact Dashboard</h1>
          <p className="text-gray-600">Tracking sustainability and economic benefits</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Transactions', value: analytics.totalTransactions.toLocaleString(), icon: Package, color: 'blue', change: '+12.5%' },
            { label: 'Items Circulated', value: analytics.itemsCirculated.toLocaleString(), icon: Users, color: 'green', change: '+8.2%' },
            { label: 'CO₂ Saved (Tons)', value: analytics.carbonSaved, icon: Leaf, color: 'emerald', change: '+15.3%' },
            { label: 'Cost Savings (₹)', value: `₹${(analytics.costSavings/100000).toFixed(1)}L`, icon: DollarSign, color: 'purple', change: '+22.1%' }
          ].map(({ label, value, icon: Icon, color, change }) => (
            <div key={label} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-8 w-8 text-${color}-600`} />
                <span className="text-green-600 text-sm font-medium">{change}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Circular Economy Metrics</h2>
            <div className="space-y-4">
              {[
                { metric: 'Average Lifecycles per Item', value: '2.3', change: '+0.4' },
                { metric: 'Packaging Reuse Rate', value: '78%', change: '+12%' },
                { metric: 'Cost Reduction per Lifecycle', value: '42%', change: '+5%' },
                { metric: 'Quality Retention Rate', value: '68%', change: '+7%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{item.metric}</span>
                  <div className="text-right">
                    <p className="font-semibold">{item.value}</p>
                    <span className="text-green-600 text-sm">↑ {item.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Lifecycle Analysis</h2>
            <div className="space-y-6">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <RefreshCw className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-green-600">2.3x</p>
                <p className="text-gray-600">Average Packaging Utilization</p>
                <p className="text-sm text-gray-500 mt-1">Compared to single-use systems</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Leaf className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Carbon Savings per Reuse</p>
                    <p className="text-sm text-gray-600">Through circular model</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-blue-600">1.2T</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Demo Transaction Impact</h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-green-600">₹39,000</p>
              <p className="text-gray-600">Buyer 1 Savings</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">₹24,000</p>
              <p className="text-gray-600">Buyer 2 Savings</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">3.0T</p>
              <p className="text-gray-600">Total CO₂ Saved</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">2</p>
              <p className="text-gray-600">Lifecycles</p>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-center">
              <button 
                onClick={() => setCurrentView('landing')}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
              >
                Complete Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Notifications
  const Notifications = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs w-full">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg flex items-start ${
            notification.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
            notification.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
            'bg-blue-100 border border-blue-300 text-blue-800'
          }`}
        >
          <div className="mr-2 mt-0.5">
            {notification.type === 'success' ? 
              <CheckCircle className="h-5 w-5 text-green-600" /> : 
              <AlertCircle className="h-5 w-5 text-red-600" />
            }
          </div>
          <div>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative">
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'roleSelection' && <RoleSelection />}
      {currentView === 'supplierDashboard' && <SupplierDashboard />}
      {currentView === 'buyerDashboard' && <BuyerDashboard />}
      {currentView === 'transporterDashboard' && <TransporterDashboard />}
      {currentView === 'adminDashboard' && <AdminDashboard />}
      {currentView === 'qualityDemo' && <QualityDemo />}
      {currentView === 'orderDemo' && <OrderDemo />}
      {currentView === 'routeDemo' && <RouteDemo setCurrentView={setCurrentView} addNotification={addNotification} />}
      {currentView === 'ratingView' && <RatingView />}
      {currentView === 'circularFlow' && <CircularFlowView />}
      {currentView === 'analytics' && <AnalyticsPage />}
      <Notifications />
    </div>
  );
};

export default PackLoopDemo;