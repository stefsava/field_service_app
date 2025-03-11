require 'simplecov'

SimpleCov.start 'rails' do
  enable_coverage :branch
  add_filter '/test/'    # Esclude i file di test
  add_filter '/config/'  # Esclude la configurazione
  add_filter '/vendor/'  # Esclude i pacchetti di terze parti
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require_relative 'helpers/session_test_helper'

module ActiveSupport
  class TestCase
    include SessionTestHelper

    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end
