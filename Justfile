set dotenv-load

# list all recipes
default:
  just --list

dev:
  pnpm run dev

build:
  pnpm run build

clear:
  find ./ -name "*.js" -not -path "./tailwind.config.js" -not -path "./postcss.config.js" -not -path "./node_modules/*" -not -path "./dist/*" -exec rm {} \;

deploy:
  just clear && just build && aws s3 cp dist/ s3://ai-assistant/ --recursive
  aws cloudfront create-invalidation --distribution-id E1EYUZC14JJ37T --paths "/*"

