import { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import BookingModal from '../components/BookingModal';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const mockResources = [
    { id: 1, name: 'Crystal Ballroom', location: 'Guntur, AP', capacity: 500, pricePerHour: 1500, image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1000', available: true, description: 'A majestic venue for grand celebrations and corporate summits in the heart of Guntur.', address: 'Ring Road, Near NTR Stadium, Guntur, Andhra Pradesh 522006' },
    { id: 2, name: 'Marble Hall Ballroom', location: 'Vijayawada, AP', capacity: 300, pricePerHour: 1200, image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Exquisite marble flooring and elegant lighting, perfect for high-profile business meetings.', address: 'M.G. Road, Labbipet, Vijayawada, Andhra Pradesh 520010' },
    { id: 3, name: 'Executive Suite A', location: 'Hyderabad, TS', capacity: 12, pricePerHour: 450, image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Sleek, modern board room equipped with high-speed fiber and 4K display systems.', address: 'HITECH City, Madhapur, Hyderabad, Telangana 500081' },
    { id: 4, name: 'Tech Hub Delta', location: 'Bangalore, KA', capacity: 45, pricePerHour: 800, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000', available: false, description: 'An industrial-style creative space designed for collaborative sprints and workshops.', address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034' },
    { id: 5, name: 'Operations Command', location: 'Visakhapatnam, AP', capacity: 100, pricePerHour: 950, image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Large-scale auditorium with theatre-style seating and advanced acoustics.', address: 'Beach Road, Siripuram, Visakhapatnam, Andhra Pradesh 530003' },
    { id: 6, name: 'The Atrium', location: 'Amaravati, AP', capacity: 200, pricePerHour: 1100, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Open-air collaborative space with natural lighting and ergonomic workstations.', address: 'Capital City Complex, Amaravati, Andhra Pradesh 522236' },
    { id: 7, name: 'Summit Point', location: 'Chennai, TN', capacity: 80, pricePerHour: 700, image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000', available: true, description: 'A focused environment for executive decision making and strategy sessions.', address: 'Anna Salai, Teynampet, Chennai, Tamil Nadu 600018' },
    { id: 8, name: 'Innovation Cell', location: 'Pune, MH', capacity: 25, pricePerHour: 550, image: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Minimalist lab for developers and research teams needing quiet focus.', address: 'Viman Nagar, Pune, Maharashtra 411014' },
    { id: 9, name: 'Nexus Plaza', location: 'Guntur, AP', capacity: 150, pricePerHour: 900, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000', available: true, description: 'A vibrant networking space in the heart of Guntur high-street.', address: 'Arundelpet, 3rd Line, Guntur, Andhra Pradesh 522002' },
    { id: 10, name: 'Legacy Library', location: 'Hyderabad, TS', capacity: 40, pricePerHour: 400, image: 'https://images.unsplash.com/photo-1497644083578-611b798c60f3?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Quiet, classic library environment for focused study and small meetings.', address: 'Banjara Hills Rd No 12, Hyderabad, Telangana 500034' },
    { id: 11, name: 'Sky Deck Alpha', location: 'Vijayawada, AP', capacity: 60, pricePerHour: 1400, image: 'https://images.unsplash.com/photo-1519781542704-957ff19eff00?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Rooftop venue with a panoramic view of the Krishna River.', address: 'Buckinghampet, Governerpet, Vijayawada, Andhra Pradesh 520002' },
    { id: 12, name: 'Creative Corner', location: 'Bangalore, KA', capacity: 15, pricePerHour: 350, image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Color-rich studio for brainstorming and visual design workflows.', address: 'Indiranagar 80 Feet Road, Bengaluru, Karnataka 560038' },
    { id: 13, name: 'Global Hub 1', location: 'Mumbai, MH', capacity: 120, pricePerHour: 1800, image: 'https://images.unsplash.com/photo-1577416414929-7a1ed2f98f8b?auto=format&fit=crop&q=80&w=1000', available: false, description: 'Premium business center in the financial capital, tailored for global connectivity.', address: 'Bandra-Kurla Complex (BKC), Mumbai, Maharashtra 400051' },
    { id: 14, name: 'Zen Workspace', location: 'Visakhapatnam, AP', capacity: 10, pricePerHour: 300, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Minimalist calm for individual contributors or pairs.', address: 'Rushikonda IT Park, Visakhapatnam, Andhra Pradesh 530045' },
    { id: 15, name: 'Grand Arena', location: 'Guntur, AP', capacity: 1000, pricePerHour: 3500, image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000', available: true, description: 'The largest event space in Guntur, built for massive conventions.', address: 'Guntur-Vijayawada Highway, Guntur, Andhra Pradesh 522501' },
    { id: 16, name: 'Viking Board Room', location: 'Hyderabad, TS', capacity: 20, pricePerHour: 650, image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Tough, professional environment for intense negotiations.', address: 'Jubilee Hills, Hyderabad, Telangana 500033' },
    { id: 17, name: 'The Lab TS-1', location: 'Amaravati, AP', capacity: 30, pricePerHour: 500, image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80&w=1000', available: true, description: 'State-of-the-art testing facility for software deployments.', address: 'Secretariat Road, Amaravati, Andhra Pradesh 522237' },
    { id: 18, name: 'Urban Collective', location: 'Chennai, TN', capacity: 250, pricePerHour: 1300, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Industrial chic hall for startup launches and meetups.', address: 'Old Mahabalipuram Rd, Sholinganallur, Chennai, Tamil Nadu 600119' },
    { id: 19, name: 'Prism meeting', location: 'Vijayawada, AP', capacity: 8, pricePerHour: 280, image: 'https://images.unsplash.com/photo-1517502884422-41eaace71e04?auto=format&fit=crop&q=80&w=1000', available: true, description: 'Smart glass-walled cabin for private interviews.', address: 'Patamata, High School Road, Vijayawada, Andhra Pradesh 520007' },
    { id: 20, name: 'The Foundry', location: 'Guntur, AP', capacity: 100, pricePerHour: 850, image: 'https://images.unsplash.com/photo-1527192491265-7e15cfa44145?auto=format&fit=crop&q=80&w=1000', available: true, description: 'A robust space for heavy-duty creative work and assembly.', address: 'Auto Nagar, Guntur, Andhra Pradesh 522001' }
];

const Resources = () => {
    const [resources, setResources] = useState(mockResources);
    const [selectedResource, setSelectedResource] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleBook = (resource) => {
        setSelectedResource(resource);
    };

    const handleConfirmBooking = (details) => {
        const updatedResources = resources.map(r =>
            r.id === details.resourceId ? { ...r, available: false } : r
        );
        setResources(updatedResources);

        // Save to bookings
        const existingBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
        const newBooking = {
            id: Date.now(),
            ...details,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('user_bookings', JSON.stringify([...existingBookings, newBooking]));

        setSelectedResource(null);
        alert('Booking confirmed for ' + details.resourceName);
    };

    const filteredResources = resources.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '5rem' }}>
            <Navbar />

            <header className="container" style={{ paddingTop: '160px', paddingBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div className="animate-pop-up">
                        <span style={{ textTransform: 'uppercase', letterSpacing: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-color)', display: 'block', marginBottom: '1rem' }}>Available Inventory</span>
                        <h1 className="heading-serif" style={{ fontSize: '4.5rem', fontWeight: 700, lineHeight: 1 }}>Resource <br /><span className="text-accent">Grid</span></h1>
                    </div>
                    <div className="animate-pop-up" style={{ animationDelay: '0.2s' }}>
                        <input
                            type="text"
                            placeholder="Explore locations (Guntur, Vijayawada...)"
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '350px',
                                padding: '1.2rem 2.5rem',
                                borderRadius: '100px',
                                border: '1px solid var(--border-color)',
                                background: 'white',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                            }}
                        />
                    </div>
                </div>
            </header>

            <main className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {filteredResources.map((resource, index) => (
                        <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <ResourceCard resource={resource} onBook={handleBook} />
                        </motion.div>
                    ))}
                </div>
            </main>

            {selectedResource && (
                <BookingModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                    onConfirm={handleConfirmBooking}
                />
            )}
        </div>
    );
};

export default Resources;
