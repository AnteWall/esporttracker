require 'sidekiq/web'
Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  root 'home#index'
  mount Sidekiq::Web => '/sidekiq'
  resources :match, only: [:show] do
    get 'track' => 'match#start_tracking'
    get 'log' => 'match#log'
  end
    
end
