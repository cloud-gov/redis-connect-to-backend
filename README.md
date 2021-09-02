# Redis connect to cloud.gov backend service

This is a demo application that shows how to use Redis pub/sub to securely connect a frontend application to a backend service using a [brokered instance of AWS Elasticache](https://cloud.gov/docs/services/aws-elasticache/).

In the example, the backend application simply echos back a message sent by the front end, but this approach could support much more complex backend functions if needed.

Benefits:

* Traffic between a frontend application and a backend service running on a separate container are fully encrypted using SSL.
* No need to create or manage network policies. All communications between the frontend and backend app happen through Redis.

Drawbacks:

* This approach to breaking out services might not be a good fit for all scenarios.
* If/when traffic between containers in Cloud Foundry is done natively using SSL, this approach might add unneeded complexity.
* Additional logic to manage or restore connections to Redis would likely be needed if this approach were to be used for a production application.


## Instructions

* Set up a new AWS Elasticache service: `cf create-service aws-elasticache-redis redis-dev {service-name}` (note - this may take several minutes to finish). Use the `service-name` in the next two steps.
* in the `/backend` directory, change the `route` and the `service-name` in the manifest.yml file. The route should use the `apps.internal` domain as we do not want this app to be accessible externally or from other app containers.
* `cf push` from the `/backend` directory.
* In the  `/frontend` directory change the `service-name` in the manifest.yml file
* `cf push` from the `/frontend` directory.

Make a curl request to the front-end app like this:

```bash
~$ curl -X POST https://frontend-app-happy-duiker-vz.app.cloud.gov/ -d '{"message":"cloud.gov is really awesome"}' -H 'Content-type:application/json
```

You should see a response like this:

```
Backend app says: Received "cloud.gov is really awesome" from the front end app on "from-frontend" channel
```
