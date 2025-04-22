import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import Image from 'next/image';

export default function EditMotorcycle() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [features, setFeatures] = useState(['']);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    cc: '',
    price: '',
    description: '',
    imageUrl: '',
    location: '',
    available: true
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=${encodeURIComponent(`/motorcycles/${id}/edit`)}`);
    }
  }, [status, router, id]);

  // Fetch motorcycle data
  useEffect(() => {
    const fetchMotorcycle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/motorcycles/${id}`);
        const motorcycle = response.data.motorcycle;
        
        // Defensive check for motorcycle and owner
        if (!motorcycle || !motorcycle.owner || !motorcycle.owner.id) {
          toast.error('Unable to load motorcycle or owner information');
          router.push('/dashboard');
          return;
        }
        
        // Check if user owns this motorcycle
        if (motorcycle.owner.id !== session?.user?.id) {
          toast.error('You do not have permission to edit this motorcycle');
          router.push('/dashboard');
          return;
        }
        
        // Set form data
        setFormData({
          name: motorcycle.name,
          brand: motorcycle.brand,
          model: motorcycle.model,
          year: motorcycle.year,
          cc: motorcycle.cc,
          price: motorcycle.price,
          description: motorcycle.description,
          imageUrl: motorcycle.imageUrl,
          location: motorcycle.location,
          available: motorcycle.available
        });
        
        // Set features
        if (motorcycle.features && motorcycle.features.length > 0) {
          setFeatures(motorcycle.features);
        } else {
          setFeatures(['']);
        }
        
        // Set preview image
        if (motorcycle.imageUrl) {
          setPreviewImage(motorcycle.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching motorcycle:', error);
        toast.error('Failed to load motorcycle details');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    if (status === 'authenticated' && id) {
      fetchMotorcycle();
    }
  }, [id, status, session, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'available') {
      setFormData({
        ...formData,
        available: !!checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };


  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  };

  const addFeatureField = () => {
    setFeatures([...features, '']);
  };

  const removeFeatureField = (index) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    setFeatures(updatedFeatures);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload image to /api/upload
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const uploadRes = await axios.post('/api/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = uploadRes.data.fileUrl;
      setFormData({
        ...formData,
        imageUrl: uploadedUrl
      });
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (status !== 'authenticated') {
      toast.error('You must be logged in to edit a motorcycle');
      router.push(`/login?redirect=/motorcycles/${id}/edit`);
      return;
    }
    
    // Filter out empty features
    const filteredFeatures = features.filter(feature => feature.trim() !== '');
    
    // Basic validation
    if (!formData.name || !formData.brand || !formData.model || !formData.year || !formData.cc || !formData.price || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    
    try {
      // Create a properly formatted data object
      const motorcycleData = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        cc: Number(formData.cc),
        price: Number(formData.price),
        description: formData.description,
        imageUrl: formData.imageUrl || '/images/motorcycle-placeholder.jpg',
        location: formData.location,
        features: filteredFeatures,
        available: Boolean(formData.available)
      };
      
      // Update the motorcycle
      await axios.patch(`/api/motorcycles/${id}`, motorcycleData);
      
      toast.success('Motorcycle updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating motorcycle:', error);
      if (error.response?.status === 401) {
        toast.error('You must be logged in to edit a motorcycle');
        setTimeout(() => {
          router.push(`/login?redirect=/motorcycles/${id}/edit`);
        }, 2000);
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data.error || 'Please check all required fields';
        const missingFields = error.response.data.missingFields;
        
        if (missingFields) {
          const missingFieldNames = Object.entries(missingFields)
            .filter(([_, isMissing]) => isMissing)
            .map(([field]) => field)
            .join(', ');
          
          toast.error(`Missing required fields: ${missingFieldNames}`);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to update motorcycle. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <Layout title="Edit Your Motorcycle">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Your Motorcycle">
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Your Motorcycle</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* All form fields here */}
              </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Motorcycle Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g. Harley-Davidson Street Glide"
                  />
                </div>
                
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand*
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g. Harley-Davidson"
                  />
                </div>
                
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Model*
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g. Street Glide"
                  />
                </div>
                
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Year*
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g. 2023"
                  />
                </div>
                
                <div>
                  <label htmlFor="cc" className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Capacity (CC)*
                  </label>
                  <input
                    type="number"
                    id="cc"
                    name="cc"
                    value={formData.cc}
                    onChange={handleChange}
                    required
                    min="50"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g. 1000"
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Rental Price (₹)*
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g. 1500"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                
                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Motorcycle Image
  </label>
  <div className="w-full">
    <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
      <div className="space-y-1 text-center">
        <Image
          src={previewImage || formData.imageUrl || '/images/motorcycle-placeholder.jpg'}
          alt="Motorcycle preview"
          width={320}
          height={200}
          style={{ objectFit: 'contain', borderRadius: '8px' }}
        />
        <div className="flex text-sm text-gray-600 justify-center mt-2">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500"
          >
            <span>Upload a file</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
      </div>
    </div>
  </div>
</div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Describe your motorcycle, its condition, and any special features..."
                ></textarea>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Features (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addFeatureField}
                    className="text-sm text-yellow-600 hover:text-yellow-700"
                  >
                    + Add Feature
                  </button>
                </div>
                
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center mt-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder={`Feature ${index + 1}`}
                    />
                    {features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeatureField(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <p className="mt-1 text-xs text-gray-500">
                  Add notable features like ABS, Cruise Control, Heated Grips, etc.
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                  Available for rent immediately
                </label>
              </div>
              
              <div className="pt-4 flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                  }`}
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 