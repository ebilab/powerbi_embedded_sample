require('dotenv').config();

const express = require('express')
const app = express()
const axios = require('axios')

app.set("view engine", "ejs");

app.get('/', async (req, res) => {

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const tenant = process.env.TENANT;
  const groupId = process.env.GROUP_ID;
  const reportId = process.env.REPORT_ID;

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('resource', 'https://analysis.windows.net/powerbi/api');
  params.append('client_secret', clientSecret);

  const url = `https://login.windows.net/${tenant}/oauth2/token`;
  const { data } = await axios.post(url, params)
    .catch(function (error) {
      console.log(error);
    });

  const accessToken = data.access_token;
  const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`;

  const response = await axios(
    {
      url: embedTokenUrl,
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        "accessLevel": "View",
        "allowSaveAs": "false"
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  const embedToken = response.data.token;

  res.render("./index.ejs", { groupId, reportId, embedToken });

});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
