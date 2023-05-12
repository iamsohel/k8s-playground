1. for nginx ingress apply 

      kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.7.1/deploy/static/provider/cloud/deploy.yaml

2. see nginx logs 

      kubectl -n ingress-nginx logs -f -l app.kubernetes.io/instance=ingress-nginx
