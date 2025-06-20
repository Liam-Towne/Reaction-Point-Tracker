public class CharacterInfo {
    private String name;
    private float level;
    private int currentPoints;
    private int maxPoints;
    private int row = 0;
    private boolean isBossMonster;
    private boolean isMonster;

    public CharacterInfo(String name, float level, boolean boss, boolean monster) {
        this.name = name;
        this.level = level;
        isBossMonster = boss;
        isMonster = monster;
        this.maxPoints = calculateMaxPoints(level);
        this.currentPoints = calculateStartPoints();
        
    }

    public String getName() {
        return name;
    }

    public float getLevel() {
        return level;
    }

    public int getCurrentPoints() {
        return currentPoints;
    }

    public int getMaxPoints() {
        return maxPoints;
    }

    public void decrementCurrentPoints() {
        if (currentPoints > 0) {
            currentPoints--;
        }
    }

    public void resetCurrentPoints() {
        currentPoints = maxPoints;
    }
    
    public void newRound() {
        switch (row) {
            case 1:
            case 2:
                currentPoints += 1;
                break;
            case 3:
            case 4:
                currentPoints += 2;
                break;            
            case 5:
            case 6:
                currentPoints += 3;
                break;            
            case 7:
            case 8:
                currentPoints += 4;
                break;
            case 9:
            case 10:
                currentPoints += 5;
                break;
            default:
                break;
        }
        
        if (currentPoints > maxPoints) {
            currentPoints = maxPoints;
        }
    }
    
    public boolean isBoss() {
        return isBossMonster;
    }

    private int calculateMaxPoints(float level) {
        int maxPoints = 0;
        
        if (isMonster) {
            level += 6;
        }
        
        if (isBossMonster) {
            level += 6;
        }
        
        row = 1;
        if (level >= 5) {
            int count = 5;
            while (count <= level) {
                if ((count+1) % 6 == 0) {
                    row++;
                }
                count++;
            }
        } 
        
        maxPoints = row + 1;
        
        return maxPoints;
    }
    
    public int calculateStartPoints() {
        int startPoints;
        
        switch (row) {
            case 1:
                startPoints = 1;
            case 2:
            case 3:
                startPoints = 2;
                break;
            case 4:
                startPoints = 3;
                break;
            case 5:
                startPoints = 4;
                break;
            case 6:
                startPoints = 6;
                break;
            case 7:
                startPoints = 7;
                break;
            case 8:
                startPoints = 9;
                break;
            case 9:
                startPoints = 10;
                break;
            case 10:
                startPoints = 11;
                break;
            default:
                startPoints = 0;
        }
        
        return startPoints;
    }
    
    public void adrenalineRush() {
        switch (row) {
            case 1:
                currentPoints += 2;
                break;
            case 2:
            case 3:
                currentPoints += 3;
                break;
            case 4:
            case 5:
                currentPoints += 4;
                break;
            case 6:
            case 7:
                currentPoints += 5;
                break; 
            case 8:
            case 9:
                currentPoints += 6;
                break;
            case 10:
                currentPoints += 7;
            default:
                return;
        }
    }
}