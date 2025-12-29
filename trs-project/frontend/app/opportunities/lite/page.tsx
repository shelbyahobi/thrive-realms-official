export default function LiteOpportunitiesPage() {
    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#000', backgroundColor: '#fff' }}>

            <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '20px', marginBottom: '20px' }}>
                <a href="/opportunities" style={{ fontSize: '12px', color: '#666' }}>&larr; Return to Graphical Version</a>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Thrive Realm: Opportunity Lite</h1>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    <strong>Access Principle:</strong> This version is optimized for low-bandwidth connections (2G/3G).
                    It retains full functionality for submission and reading.
                </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '18px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>Investment Mandate</h2>
                <p style={{ fontSize: '14px' }}>We prioritize funding for:</p>
                <ul style={{ fontSize: '14px' }}>
                    <li>Sub-Saharan Africa</li>
                    <li>South Asia</li>
                    <li>Latin America</li>
                    <li>MENA Region</li>
                </ul>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '18px', borderBottom: '2px solid #000', paddingBottom: '5px' }}>The 5-Point Success Formula</h2>
                <ol style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <li><strong>The Impact:</strong> 2-sentence summary of the business.</li>
                    <li><strong>The Need:</strong> Clear budget requirements.</li>
                    <li><strong>The Return:</strong> What the DAO gets back.</li>
                    <li><strong>The Milestones:</strong> 3 simple checkpoints.</li>
                    <li><strong>The Proof:</strong> Local registration/ID.</li>
                </ol>
            </div>

            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', border: '1px solid #ddd' }}>
                <h2 style={{ fontSize: '18px', marginTop: 0 }}>Submit Opportunity (Text Only)</h2>
                <form>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>BUSINESS NAME</label>
                        <input type="text" style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>COUNTRY</label>
                        <input type="text" style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>WHATSAPP NUMBER</label>
                        <input type="tel" style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>FUNDING ASK ($)</label>
                        <input type="text" style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>IMPACT SUMMARY</label>
                        <textarea rows={5} style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc' }}></textarea>
                    </div>

                    <button type="submit" style={{ backgroundColor: '#000', color: '#fff', padding: '10px 20px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                        SUBMIT APPLICATION
                    </button>
                    <p style={{ fontSize: '10px', marginTop: '10px', color: '#666' }}>
                        * Submissions are processed with equal priority to the graphical site.
                    </p>
                </form>
            </div>
        </div>
    );
}
