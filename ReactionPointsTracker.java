import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;

public class ReactionPointsTracker {
    private JFrame frame;
    private ArrayList<JTextField> characterNameFields;
    private ArrayList<JTextField> characterLevelFields;
    private ArrayList<CharacterInfo> characters;
    private JPanel charactersPanel;
    private ArrayList<JLabel> pointsLabels; // Added to keep track of JLabels for points
    private ArrayList<JCheckBox> dieCheckBoxes;
    private ArrayList<JCheckBox> bossCheckBoxes;
    private static boolean isMonsterTracker = false;
    private Font font = new Font("Arial", Font.PLAIN, 20);
    private Font font2 = new Font("Arial", Font.BOLD, 20);

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                ReactionPointsTracker tracker = new ReactionPointsTracker();
                tracker.createInitialGUI();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        
        if (args.length > 0) {
            // Set isMonsterTracker to true if there's at least one argument
            isMonsterTracker = true;
        }
    }

    public ReactionPointsTracker() {
        characterNameFields = new ArrayList<>();
        characterLevelFields = new ArrayList<>();
        characters = new ArrayList<>();
        pointsLabels = new ArrayList<>(); // Initialize the ArrayList
        dieCheckBoxes = new ArrayList<>();
        bossCheckBoxes = new ArrayList<>();
    }

    public void createInitialGUI() {
        frame = new JFrame("Reaction Points Tracker");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(400, 400);
        frame.setLayout(new BorderLayout());

        characterNameFields = new ArrayList<>();
        characterLevelFields = new ArrayList<>();
        characters = new ArrayList<>();

        JPanel inputPanel = new JPanel();
        inputPanel.setLayout(new BoxLayout(inputPanel, BoxLayout.Y_AXIS));
        frame.add(inputPanel, BorderLayout.CENTER);

        JButton addNewButton = new JButton("Add New");
        addNewButton.addActionListener(e -> {
            JPanel nameLevelPanel = new JPanel();
            nameLevelPanel.setLayout(new BoxLayout(nameLevelPanel, BoxLayout.X_AXIS));

            JTextField characterNameField = new JTextField(24);
            Dimension nameFieldDimension = characterNameField.getPreferredSize();
            nameFieldDimension.height = 20;
            characterNameField.setPreferredSize(nameFieldDimension);
            characterNameField.setMaximumSize(nameFieldDimension);

            JTextField characterLevelField = new JTextField(1);
            Dimension levelFieldDimension = characterLevelField.getPreferredSize();
            levelFieldDimension.height = 20;
            levelFieldDimension.width = nameFieldDimension.width / 5;
            characterLevelField.setPreferredSize(levelFieldDimension);
            characterLevelField.setMaximumSize(levelFieldDimension);

            characterNameFields.add(characterNameField);
            characterLevelFields.add(characterLevelField);
            
            JCheckBox isBoss = new JCheckBox();
            bossCheckBoxes.add(isBoss);
            
            nameLevelPanel.add(characterNameField);
            nameLevelPanel.add(Box.createHorizontalStrut(3));
            nameLevelPanel.add(characterLevelField);
            nameLevelPanel.add(isBoss);

            inputPanel.add(Box.createVerticalStrut(5));
            inputPanel.add(nameLevelPanel);

            frame.validate();
            frame.repaint();
        });

        JButton doneButton = new JButton("Done");
        doneButton.addActionListener(e -> {
            for (int i = 0; i < characterNameFields.size(); i++) {
                String characterName = characterNameFields.get(i).getText();
                float characterLevel = Float.parseFloat(characterLevelFields.get(i).getText());
                boolean boss = bossCheckBoxes.get(i).isSelected();
                characters.add(new CharacterInfo(characterName, characterLevel, boss, isMonsterTracker));
            }
            createMainGUI();
        });

        frame.add(addNewButton, BorderLayout.NORTH);
        frame.add(doneButton, BorderLayout.SOUTH);

        frame.setVisible(true);
    }

    public void createMainGUI() {
        frame.getContentPane().removeAll();
        frame.repaint();
        frame.setLayout(new BorderLayout());

        charactersPanel = new JPanel(new GridBagLayout());
        frame.add(charactersPanel, BorderLayout.CENTER);

        GridBagConstraints c = new GridBagConstraints();
        c.gridx = 0;
        c.gridy = 0;
        c.weightx = 1;
        c.weighty = 1;
        c.fill = GridBagConstraints.HORIZONTAL;
        c.insets = new Insets(5, 5, 5, 5);

        JLabel charactersLabel = new JLabel("Characters");
        charactersLabel.setFont(font); // new
        charactersPanel.add(charactersLabel, c);
        c.gridx++;
        JLabel pointsL = new JLabel("Points");
        pointsL.setFont(font); // new
        charactersPanel.add(pointsL, c);
        c.gridx++;
        JLabel dieLabel = new JLabel("Rush");
        dieLabel.setFont(font); // new
        charactersPanel.add(dieLabel, c);
        c.gridx++;
        JLabel updateLabel = new JLabel("Update");
        updateLabel.setFont(font); // new
        charactersPanel.add(updateLabel, c);
        
        JLabel characterName;
        int rowIndex = 1;
        for (CharacterInfo character : characters) {
            c.gridx = 0;
            c.gridy = rowIndex;
            
            characterName = new JLabel(character.getName() + ":"); // new
            characterName.setFont(font2);  // new
            charactersPanel.add(characterName, c);
            //charactersPanel.add(new JLabel(character.getName() + ":"), c);
            c.gridx++;
            
            JLabel pointsLabel = new JLabel(character.getCurrentPoints() + "/" + character.getMaxPoints());
            pointsLabel.setFont(font); // new
            
            charactersPanel.add(pointsLabel, c);
            pointsLabels.add(pointsLabel);
        
            c.gridx++;
        
            // Create a JPanel with FlowLayout for the "Die" column
            JPanel diePanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        
            JCheckBox dieCheckBox = new JCheckBox();
            diePanel.add(dieCheckBox); // Add the dieCheckBox to the diePanel
            dieCheckBoxes.add(dieCheckBox);
            
            dieCheckBox.addActionListener(e -> {
                if (dieCheckBox.isSelected()) {
                    character.adrenalineRush();
                    pointsLabel.setText(character.getCurrentPoints() + "/" + character.getMaxPoints());
                }                
            }); 
        
            if (character.isBoss()) {
                JCheckBox secondDieCheckBox = new JCheckBox();
                diePanel.add(secondDieCheckBox); // Add the secondDieCheckBox to the diePanel
                dieCheckBoxes.add(secondDieCheckBox);
                secondDieCheckBox.addActionListener(e -> {
                if (secondDieCheckBox.isSelected()) {
                    character.adrenalineRush();
                    pointsLabel.setText(character.getCurrentPoints() + "/" + character.getMaxPoints());
                }                
            });
            }
        
            // Add the diePanel to the charactersPanel
            charactersPanel.add(diePanel, c);
        
            c.gridx++;
            JButton pointUsedButton = new JButton("Point");
            pointUsedButton.setFont(font); // new
            pointUsedButton.setPreferredSize(new Dimension(40, 30)); // new
            pointUsedButton.addActionListener(e -> {
                character.decrementCurrentPoints();
                pointsLabel.setText(character.getCurrentPoints() + "/" + character.getMaxPoints());
            });
            charactersPanel.add(pointUsedButton, c);            
            
                       
        
            rowIndex++;
        }

        JButton newRoundButton = new JButton("New Round");
        newRoundButton.addActionListener(e -> {
            for (int i = 0; i < characters.size(); i++) {
                CharacterInfo character = characters.get(i);
                character.newRound();
                JLabel pointsLabel = pointsLabels.get(i);
                pointsLabel.setText(character.getCurrentPoints() + "/" + character.getMaxPoints());
            }
            /*for (int i = 0; i < dieCheckBoxes.size(); i++) {
                JCheckBox dieCheckBox = dieCheckBoxes.get(i);
                dieCheckBox.setSelected(false);
            }*/
        });

        frame.add(newRoundButton, BorderLayout.SOUTH);

        frame.validate();
        frame.repaint();
    }
}

