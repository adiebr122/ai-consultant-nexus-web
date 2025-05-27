
const ClientLogos = () => {
  const clients = [
    { name: 'Telkom Indonesia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Telkom_Indonesia_2013.svg/200px-Telkom_Indonesia_2013.svg.png' },
    { name: 'Bank Central Asia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/BCA_logo.svg/200px-BCA_logo.svg.png' },
    { name: 'Gojek', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Gojek_logo_2019.svg/200px-Gojek_logo_2019.svg.png' },
    { name: 'Tokopedia', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Tokopedia.svg/200px-Tokopedia.svg.png' },
    { name: 'Shopee', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/200px-Shopee_logo.svg.png' },
    { name: 'Grab', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Grab_%28application%29_logo.svg/200px-Grab_%28application%29_logo.svg.png' },
    { name: 'OVO', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/200px-Logo_ovo_purple.svg.png' },
    { name: 'Bukalapak', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bukalapak_official_logo.svg/200px-Bukalapak_official_logo.svg.png' }
  ];

  return (
    <section id="portfolio" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dipercaya oleh Perusahaan Terkemuka
          </h2>
          <p className="text-lg text-gray-600">
            Lebih dari 150+ perusahaan besar Indonesia telah mempercayakan transformasi digital mereka kepada kami
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {clients.map((client, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 group"
            >
              <img 
                src={client.logo} 
                alt={client.name}
                className="max-h-12 w-auto opacity-60 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/120x60/f3f4f6/6b7280?text=${client.name.replace(' ', '+')}`;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
