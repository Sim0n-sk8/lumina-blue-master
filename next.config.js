module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],

    domains: [
      'www.imageeyecareoptometrists.com',
      's3.eu-west-2.amazonaws.com',
      'ocumail-content.s3.eu-west-2.amazonaws.com',
      'www.eyecareportal.com',
      'www.ocumail.com',
      'luminablue-blogs.s3.eu-west-2.amazonaws.com'
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/api/proxy/available_slots',
        destination: 'https://passport.nevadacloud.com/api/v1/public/appointments/available_slots',
      },
      {
        source: '/api/proxy/book_appointment',
        destination: 'https://www.eyecareportal.com/api/book_appointment/',
      },
    ];
  },
}