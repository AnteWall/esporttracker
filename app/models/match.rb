class Match < ActiveRecord::Base
  has_many :match_events, :dependent => :destroy
  
  scope :events, ->(last) { includes(:match_events) }
  scope :finished, -> { where(status: 'finished') }
  scope :upcoming, -> { where(status: 'upcoming') }
  scope :live, -> { where(status: 'started').where.not(team_1: nil).where.not(team_2: nil) }
  def self.types
    [
      RoundWinEvent
    ]
  end 

  def round_win_team_1
    self.increment!(:team_1_score)
  end

  def round_win_team_2
    self.increment!(:team_2_score)
  end

  def set_teams(team_1,team_2)
    self.team_1 = team_1
    self.team_2 = team_2
    self.save!
  end

end
