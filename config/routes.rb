require 'sidetiq/web'
require 'sidekiq/web'

Rails.application.routes.draw do
  devise_for :users
  get 'about' => 'about#index'

  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  mount Sidekiq::Web => '/sidekiq', constraints: CanCanConstraint.new(:manage, :sidekiq)

  resources :match, only: [:show] do
    get 'track' => 'match#start_tracking'
    get 'log' => 'match#log'
  end

  scope 'api' do
    scope :match do
      get 'live' => 'match#live'
    end
  end

  get 'test' => 'home#test'

  root 'home#index'
end
