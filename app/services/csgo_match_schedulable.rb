
class CSGOMatchScheduable
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { hourly.minute_of_hour(0) }

  def perform

  end

  private



end