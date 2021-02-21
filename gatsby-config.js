module.exports = {
  pathPrefix: "/valheim-tools",
  siteMetadata: {
    title: "ValheimTools",
  },
  plugins: [
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "G-KWLG67MPMS",
      },
    },
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-offline",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
  ],
};
