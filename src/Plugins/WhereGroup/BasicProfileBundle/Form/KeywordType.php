<?php

namespace Plugins\WhereGroup\BasicProfileBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\CallbackTransformer;

/**
 * Class KeywordType
 * @package Plugins\WhereGroup\BasicProfileBundle\Form
 */
class KeywordType extends AbstractType
{
    private $plugin;

    public function __construct($plugin = null)
    {
        $this->plugin = $plugin;
    }

    /**
     *
     */
    public function __destruct()
    {
        unset($this->plugin);
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        $help = $this->plugin->getActiveProfiles();
        $profiles = array_combine(array_keys($help), array_keys($help));

        $builder
            ->add('identifier', TextType::class, array('label' => 'Identifier'))
            ->add('title', TextType::class, array('label' => 'Titel'))
            ->add('date', TextType::class, array('label' => 'Datum'))
            ->add('dateType', ChoiceType::class, array(
                'label'   => 'Beschreibung',
                'choices' => array(
                    'Erstellungsdatum' => 'creation',
                    'Überarbeitung'    => 'revision',
                    'Veröffentlichung' => 'publication',
                ),
            ))
            ->add('cardinality', ChoiceType::class, array(
                'label'   => 'Kardinalität',
                'choices' => array(
                    'Optional'    => 'optional',
                    'Conditional' => 'conditional',
                    'Mandatory'   => 'mandatory',
                ),
            ))
            ->add('keywords', TextareaType::class, array(
                'label'    => 'Schlüsselwörter',
                'required' => false,
            ))
            ->add('repository', CheckboxType::class, array(
                'label'    => 'Repository',
                'required' => false,
            ))
            ->add('profiles', ChoiceType::class, array(
                'required' => false,
                'choices'  => $profiles,
                'multiple' => true,
                'expanded' => true,
            ));
        $builder->get('keywords')
            ->addModelTransformer(new CallbackTransformer(
                function ($keywords) {
                    return is_array($keywords) ? implode(', ', $keywords) : '';
                },
                function ($keywords) {
                    $keywords = explode(',', $keywords);
                    $keywords = array_map('trim', $keywords);

                    return $keywords;
                }
            ));
        $builder->get('date')
            ->addModelTransformer(new CallbackTransformer(
                function ($date) {
                    return ($date instanceof \DateTime) ? $date->format('Y-m-d') : '';
                },
                function ($date) {
                    return \DateTime::createFromFormat('Y-m-d', $date);
                }
            ));

        $builder->get('profiles')
            ->addModelTransformer(new CallbackTransformer(
                function ($profiles) {
                    return  $profiles ? json_decode($profiles) : array();
                },
                function ($profiles) {
                    return json_encode($profiles);
                }
            ));
    }
}
